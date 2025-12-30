"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";

/**
 * Wrapper component that conditionally renders Navigation
 * Hides navigation on immersive pages like the album play/slideshow page
 */
export default function NavigationWrapper() {
  const pathname = usePathname();

  // Hide navigation on play page for immersive fullscreen experience
  const isImmersivePage = pathname?.startsWith("/albums/play");

  if (isImmersivePage) {
    return null;
  }

  return <Navigation />;
}
