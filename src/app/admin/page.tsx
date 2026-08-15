import React from "react";
import { AdminLoginForm } from "@/components/pages/admin/login-form";

export const metadata = {
  title: "Login Petugas | Portal Administrasi Pemilih Kabupaten Tegal",
  description: "Portal masuk petugas PPS, PPK, dan Panitia Pemilihan Kabupaten Tegal.",
};

export default function AdminPage() {
  return <AdminLoginForm />;
}
