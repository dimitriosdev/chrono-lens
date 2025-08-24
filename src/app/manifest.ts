import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chrono Lens - Modern Photo Album App",
    short_name: "Chrono Lens",
    description:
      "Capture, organize, and revisit your favorite memories with Chrono Lens. Simple, beautiful, and accessible photo management.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#06b6d4",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/favicon.ico",
        sizes: "32x32",
        type: "image/x-icon",
      },
    ],
    categories: ["photo", "productivity", "lifestyle"],
  };
}
