import assert from "node:assert/strict";
import { test } from "node:test";
import { QUALITY_BREAKPOINTS } from "@/constants/transform";
import snapToNearestBreakpoint from "@/utils/snapToNearestBreakpoint";

test("rounds to the closest breakpoint in either direction", () => {
  assert.equal(
    snapToNearestBreakpoint({ value: 83, breakpoints: QUALITY_BREAKPOINTS }),
    85,
  );
  assert.equal(
    snapToNearestBreakpoint({ value: 68, breakpoints: QUALITY_BREAKPOINTS }),
    65,
  );
});

// The API compares with `<`, not `<=`, so an exactly-equidistant value keeps the
// breakpoint it met first. Signing has to reproduce that or the link 401s.
test("keeps the lower breakpoint on a tie, matching the API's reduce", () => {
  assert.equal(
    snapToNearestBreakpoint({ value: 80, breakpoints: QUALITY_BREAKPOINTS }),
    75,
  );
  assert.equal(
    snapToNearestBreakpoint({ value: 57.5, breakpoints: QUALITY_BREAKPOINTS }),
    50,
  );
});
