import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = {
  title: "TransitOps | Operations Dashboard",
  description: "Smart Transport Operations Platform — Odoo ERP Hackathon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
