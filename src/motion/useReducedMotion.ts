import { useEffect, useState } from "react";

/**
 * Live reduced-motion preference (OS setting + in-app override).
 * "system" follows matchMedia; "reduce"/"full" force a mode for testing.
 */
export type MotionPreference = "system" | "reduce" | "full";

const OVERRIDE_KEY = "nes-motion";

export function useSystemReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export function useMotionOverride(): [MotionPreference, (m: MotionPreference) => void] {
  const [pref, setPref] = useState<MotionPreference>(() => {
    try {
      const v = localStorage.getItem(OVERRIDE_KEY);
      return v === "reduce" || v === "full" ? v : "system";
    } catch {
      return "system";
    }
  });

  const set = (m: MotionPreference) => {
    setPref(m);
    try {
      localStorage.setItem(OVERRIDE_KEY, m);
    } catch {
      /* private mode — override simply won't persist */
    }
  };

  return [pref, set];
}

/** Effective rule: forced reduce, OS reduce, or full motion. */
export function resolveReducedMotion(pref: MotionPreference, system: boolean): boolean {
  if (pref === "reduce") return true;
  if (pref === "full") return false;
  return system;
}
