/**
 * Design System Helper Functions
 */

import { componentVariants } from "./components";

export const helpers = {
  /**
   * Get color with opacity (Tailwind format)
   */
  withOpacity: (color: string, opacity: number) =>
    `${color}/${Math.round(opacity * 100)}`,

  /**
   * Build responsive class string from breakpoint map
   */
  responsive: (classes: Record<string, string>) =>
    Object.entries(classes)
      .map(([breakpoint, className]) =>
        breakpoint === "base" ? className : `${breakpoint}:${className}`
      )
      .join(" "),

  /**
   * Merge class names, filtering out falsy values
   */
  cn: (...classes: (string | undefined | null | boolean)[]) =>
    classes.filter(Boolean).join(" "),

  /**
   * Get variant classes for a component
   */
  variant: <T extends keyof typeof componentVariants>(
    component: T,
    variant: keyof (typeof componentVariants)[T],
    additional?: string
  ) => {
    const base = componentVariants[component][variant] as string;
    return additional ? `${base} ${additional}` : base;
  },
} as const;

export type Helpers = typeof helpers;
