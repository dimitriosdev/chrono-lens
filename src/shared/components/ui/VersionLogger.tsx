"use client";

import { useEffect } from "react";
import { logVersionInfo } from "@/shared/lib/version";

export function VersionLogger() {
  useEffect(() => {
    logVersionInfo();
  }, []);

  return null;
}
