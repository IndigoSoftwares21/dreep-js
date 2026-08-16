interface SnapUpToBreakpointParams {
  value: number;
  breakpoints: readonly number[];
}

/**
 * Rounds up to the nearest allowed value, so a snapped request never delivers
 * something smaller than what was asked for. Anything above the top breakpoint
 * falls back to it rather than passing through.
 *
 * Mirrors snapUpToBreakpoint in dreep_server — see WIDTH_BREAKPOINTS.
 */
const snapUpToBreakpoint = ({
  value,
  breakpoints,
}: SnapUpToBreakpointParams): number => {
  for (const breakpoint of breakpoints) {
    if (value <= breakpoint) {
      return breakpoint;
    }
  }

  return breakpoints[breakpoints.length - 1] as number;
};

export default snapUpToBreakpoint;
