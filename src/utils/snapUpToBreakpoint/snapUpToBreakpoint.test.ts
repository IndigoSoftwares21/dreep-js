import assert from "node:assert/strict";
import { test } from "node:test";
import { WIDTH_BREAKPOINTS } from "@/constants/transform";
import snapUpToBreakpoint from "@/utils/snapUpToBreakpoint";

test("rounds up to the next breakpoint", () => {
  assert.equal(
    snapUpToBreakpoint({ value: 803, breakpoints: WIDTH_BREAKPOINTS }),
    828,
  );
  assert.equal(
    snapUpToBreakpoint({ value: 1, breakpoints: WIDTH_BREAKPOINTS }),
    16,
  );
});

test("leaves an exact breakpoint alone", () => {
  assert.equal(
    snapUpToBreakpoint({ value: 640, breakpoints: WIDTH_BREAKPOINTS }),
    640,
  );
});

test("clamps to the top breakpoint rather than passing a larger value through", () => {
  assert.equal(
    snapUpToBreakpoint({ value: 99_999, breakpoints: WIDTH_BREAKPOINTS }),
    4000,
  );
});
