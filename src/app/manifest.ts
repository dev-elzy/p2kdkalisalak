import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "P2KD Desa Kalisalak - Portal Pilkades 2027",
    short_name: "P2KD Kalisalak",
    description: "Sistem Informasi & Layanan Terpadu Pilkades Desa Kalisalak Kecamatan Margasari Kabupaten Tegal",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#1e3a8a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
