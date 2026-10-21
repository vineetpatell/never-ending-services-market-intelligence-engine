import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Register GSAP plugins once. Safe to call from any demo component. */
export function useGsapPlugins(): void {
  useEffect(() => {
    if (!registered) {
      gsap.registerPlugin(ScrollTrigger);
      registered = true;
    }
  }, []);
}

/**
 * useGsapDemo runs `create` with a gsap.context scoped to `scope`,
 * and reverts everything (tweens, ScrollTriggers, listeners) on unmount
 * or when `deps` change. Reduced-motion demos should skip `create`
 * and render their static end-state instead.
 */
export function useGsapDemo(
  scope: React.RefObject<HTMLElement | null>,
  create: (ctx?: gsap.Context) => void | (() => void),
  deps: React.DependencyList = [],
  disabled = false,
): void {
  useEffect(() => {
    const element = scope.current;
    if (disabled || !element) return;
    const ctx = gsap.context(() => {
      create();
    }, element);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, ...deps]);
}

export { gsap, ScrollTrigger };
