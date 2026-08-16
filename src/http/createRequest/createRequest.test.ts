import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { AUTH_SCHEME, HEADER, HTTP_METHOD, HTTP_STATUS } from "@/constants/http";
import { API_PATH } from "@/constants/api";
import DreepAuthError from "@/errors/DreepAuthError";
import DreepConnectionError from "@/errors/DreepConnectionError";
import DreepLimitError from "@/errors/DreepLimitError";
import createRequest from "@/http/createRequest";

const API_KEY = "drp_live_test";

interface FetchCall {
    url: string;
    init: RequestInit;
}

const originalFetch = globalThis.fetch;
const calls: FetchCall[] = [];

/** Replaces fetch with a queue of canned responses, recording what was sent. */
const stubFetch = (responses: Response[]): void => {
    calls.length = 0;
    let index = 0;

    globalThis.fetch = (async (url: string, init: RequestInit) => {
        calls.push({ url: String(url), init });
        const response = responses[Math.min(index, responses.length - 1)];
        index += 1;
        return response;
    }) as typeof fetch;
};

const jsonResponse = (body: unknown, status = 200): Response =>
    new Response(JSON.stringify(body), { status });

afterEach(() => {
    globalThis.fetch = originalFetch;
});

test("sends the API key as a bearer token", async () => {
    stubFetch([jsonResponse({ message: "ok", code: 200, data: { id: "1" } })]);

    await createRequest({ apiKey: API_KEY })({
        method: HTTP_METHOD.GET,
        path: API_PATH.USAGE,
    });

    const headers = calls[0]?.init.headers as Record<string, string>;
    assert.equal(headers[HEADER.AUTHORIZATION], `${AUTH_SCHEME} ${API_KEY}`);
});

test("unwraps the { message, code, data } envelope", async () => {
    stubFetch([jsonResponse({ message: "ok", code: 200, data: { id: "asset-1" } })]);

    const result = await createRequest({ apiKey: API_KEY })({
        method: HTTP_METHOD.GET,
        path: API_PATH.MEDIA,
    });

    assert.deepEqual(result, { id: "asset-1" });
});

test("builds the URL with the version prefix and sorted query", async () => {
    stubFetch([jsonResponse({ data: [] })]);

    await createRequest({ apiKey: API_KEY })({
        method: HTTP_METHOD.GET,
        path: API_PATH.MEDIA,
        query: { page: 2, folder: "avatars", limit: undefined },
    });

    assert.ok(
        calls[0]?.url.endsWith("/api/v1/media?folder=avatars&page=2"),
        `unexpected url: ${calls[0]?.url}`,
    );
});

test("maps an error status onto a typed error", async () => {
    stubFetch([jsonResponse({ message: "Invalid API key" }, HTTP_STATUS.UNAUTHORIZED)]);

    await assert.rejects(
        createRequest({ apiKey: API_KEY })({
            method: HTTP_METHOD.GET,
            path: API_PATH.USAGE,
        }),
        (error: unknown) =>
            error instanceof DreepAuthError && error.message === "Invalid API key",
    );
});

test("surfaces a 402 with its billing metadata", async () => {
    stubFetch([
        jsonResponse(
            {
                message: "Limit reached",
                data: { code: "LIMIT_EXCEEDED", featureKey: "storage_bytes", used: 5, limit: 4 },
            },
            HTTP_STATUS.PAYMENT_REQUIRED,
        ),
    ]);

    await assert.rejects(
        createRequest({ apiKey: API_KEY })({
            method: HTTP_METHOD.POST,
            path: API_PATH.UPLOAD,
        }),
        (error: unknown) =>
            error instanceof DreepLimitError && error.featureKey === "storage_bytes",
    );
});

test("retries a GET that fails with a 500", async () => {
    stubFetch([
        jsonResponse({ message: "boom" }, HTTP_STATUS.INTERNAL_SERVER_ERROR),
        jsonResponse({ data: { id: "recovered" } }),
    ]);

    const result = await createRequest({ apiKey: API_KEY })({
        method: HTTP_METHOD.GET,
        path: API_PATH.USAGE,
    });

    assert.deepEqual(result, { id: "recovered" });
    assert.equal(calls.length, 2);
});

test("never retries a POST — a repeated upload would bill twice", async () => {
    stubFetch([jsonResponse({ message: "boom" }, HTTP_STATUS.INTERNAL_SERVER_ERROR)]);

    await assert.rejects(
        createRequest({ apiKey: API_KEY })({
            method: HTTP_METHOD.POST,
            path: API_PATH.UPLOAD,
        }),
    );

    assert.equal(calls.length, 1);
});

test("reports a network failure as a connection error", async () => {
    globalThis.fetch = (async () => {
        throw new TypeError("fetch failed");
    }) as typeof fetch;

    await assert.rejects(
        createRequest({ apiKey: API_KEY })({
            method: HTTP_METHOD.POST,
            path: API_PATH.UPLOAD,
        }),
        (error: unknown) => error instanceof DreepConnectionError,
    );
});

test("an aborted signal surfaces as a connection error", async () => {
    globalThis.fetch = (async (_url: string, init: RequestInit) => {
        init.signal?.throwIfAborted();
        throw new Error("unreachable");
    }) as typeof fetch;

    const controller = new AbortController();
    controller.abort();

    await assert.rejects(
        createRequest({ apiKey: API_KEY })({
            method: HTTP_METHOD.POST,
            path: API_PATH.UPLOAD,
            signal: controller.signal,
        }),
        (error: unknown) => error instanceof DreepConnectionError,
    );
});
