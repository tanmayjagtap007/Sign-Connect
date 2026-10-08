"use client";

import { useEffect } from "react";
import { getSettings } from "@/lib/storage";

export default function ThemeInitializer() {
  useEffect(() => {
    const settings = getSettings();
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    document.documentElement.classList.toggle("font-large", settings.largeText);
  }, []);
  return null;
}
