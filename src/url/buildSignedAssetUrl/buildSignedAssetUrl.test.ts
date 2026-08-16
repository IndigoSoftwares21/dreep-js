import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { QUERY_PARAM } from "@/constants/api";
import DreepError from "@/errors/DreepError";
import buildSignedAssetUrl from "@/url/buildSignedAssetUrl";

/**
 * Every signature below was produced by the API's own signing code
 * (dreep_server/src/services/assetSigning) for the same inputs — they are not
 * recorded from this implementation.
 *
 * A failure here means the SDK and the API disagree about what gets signed, and
 * every signed URL of that shape will 401 in production. Regenerate these only
 * by running the server's signer, never by copying what this code produces.
 */
const ASSET = {
    id: "2f928a3f-1d2a-4a2b-9c3d-4e5f60718293",
    url: "https://cdn.dreep.cloud/api/v1/fetch/2f928a3f-1d2a-4a2b-9c3d-4e5f60718293",
};
const SIGNING_SECRET = "test-signing-secret";
const EXPIRES = 1774118400;
const EXPIRES_IN = 3600;

const originalNow = Date.now;

/** Pins the clock so `expires` is deterministic. */
const freezeClock = (): void => {
    Date.now = () => (EXPIRES - EXPIRES_IN) * 1000;
};

afterEach(() => {
    Date.now = originalNow;
});

const signatureOf = (url: string): string | null =>
    new URL(url).searchParams.get(QUERY_PARAM.SIGNATURE);

test("matches the API's signature with no transform", () => {
    freezeClock();

    const url = buildSignedAssetUrl({
        asset: ASSET,
        signingSecret: SIGNING_SECRET,
        expiresIn: EXPIRES_IN,
    });

    assert.equal(
        signatureOf(url),
        "6b10e022e50a41b47df0adfb9c02fb3b5965f8657ebc189114452b57c2c9ca57",
    );
    assert.equal(new URL(url).searchParams.get(QUERY_PARAM.EXPIRES), String(EXPIRES));
});

test("matches the API's signature for a snapped width", () => {
    freezeClock();

    const url = buildSignedAssetUrl({
        asset: ASSET,
        signingSecret: SIGNING_SECRET,
        expiresIn: EXPIRES_IN,
        transform: { format: "webp", width: 803 },
    });

    assert.equal(
        signatureOf(url),
        "e948168f487491d5ce733bc3eae716882578a9e0f54ee5828dd75191e8525468",
    );
});

test("matches the API's signature across width, height, quality and dpr", () => {
    freezeClock();

    const url = buildSignedAssetUrl({
        asset: ASSET,
        signingSecret: SIGNING_SECRET,
        expiresIn: EXPIRES_IN,
        transform: { quality: 80, dpr: 2, width: 400, height: 300, fit: "cover" },
    });

    assert.equal(
        signatureOf(url),
        "9f81d4a241b0b1e0d538b91809102d9998ec7153cd1392f3715d65c179a49b5e",
    );
});

test("matches the API's signature for a preset", () => {
    freezeClock();

    const url = buildSignedAssetUrl({
        asset: ASSET,
        signingSecret: SIGNING_SECRET,
        expiresIn: EXPIRES_IN,
        transform: { preset: "thumbnail" },
    });

    assert.equal(
        signatureOf(url),
        "e0a05eb2479d840ba7a8b980af75f032190599fb124996edd07641133802f9fa",
    );
});

test("keeps the transform on the URL alongside the signature", () => {
    freezeClock();

    const url = new URL(
        buildSignedAssetUrl({
            asset: ASSET,
            signingSecret: SIGNING_SECRET,
            expiresIn: EXPIRES_IN,
            transform: { width: 803, format: "webp" },
        }),
    );

    assert.equal(url.searchParams.get(QUERY_PARAM.WIDTH), "803");
    assert.equal(url.searchParams.get(QUERY_PARAM.FORMAT), "webp");
});

test("throws when no signing secret is configured", () => {
    assert.throws(
        () =>
            buildSignedAssetUrl({
                asset: ASSET,
                signingSecret: undefined,
                expiresIn: EXPIRES_IN,
            }),
        (error: unknown) => error instanceof DreepError,
    );
});
