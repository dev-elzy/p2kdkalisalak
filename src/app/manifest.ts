import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "P2KD Desa Kalisalak - Portal Petugas & Sekretariat",
    short_name: "P2KD Petugas",
    description: "Aplikasi Operasional P2KD Desa Kalisalak, Coklit Lapangan, DPT & Real Count Pilkades 2027",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#1e3a8a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/pwa-icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/pwa-maskable.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
