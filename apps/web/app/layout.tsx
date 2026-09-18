import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lollipop — Enter the next dimension",
  description: "A futuristic creator media experience.",
  applicationName: "Lollipop",
  manifest: "/manifest.webmanifest",
  themeColor: "#07070B",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Lollipop" },
  icons: { icon: "/icons/lollipop.svg", apple: "/icons/lollipop.svg" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
