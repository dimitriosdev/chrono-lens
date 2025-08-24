"use client";

import { useEffect } from "react";
import { logVersionInfo } from "@/lib/version";

export function VersionLogger() {
  useEffect(() => {
    logVersionInfo();
  }, []);

  return null;
}
