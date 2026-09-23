"use client";

import * as React from "react";
import { MotionConfig } from "motion/react";

// Single fixed (light) theme, no toggle — this just centralizes the
// reduced-motion setting for every Motion component on the page.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
