interface SnapToNearestBreakpointParams {
  value: number;
  breakpoints: readonly number[];
}

/**
 * Rounds to whichever breakpoint is closest in either direction. Used for
 * quality, where overshooting costs bytes for no visible gain.
 *
 * Mirrors snapToNearestBreakpoint in dreep_server — see QUALITY_BREAKPOINTS.
 */
const snapToNearestBreakpoint = ({
  value,
  breakpoints,
}: SnapToNearestBreakpointParams): number =>
  breakpoints.reduce((nearest, breakpoint) =>
    Math.abs(breakpoint - value) < Math.abs(nearest - value)
      ? breakpoint
      : nearest,
  );

export default snapToNearestBreakpoint;
