import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "./service-worker-registration";
import PwaInstallPrompt from "./pwa-install-prompt";

export const metadata: Metadata = {
  title: "Lollipop — Enter the next dimension",
  description: "A futuristic creator media experience.",
  applicationName: "Lollipop",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Lollipop" },
  icons: { icon: "/icons/lollipop.svg", apple: "/icons/lollipop.svg" }
};

export const viewport: Viewport = {
  themeColor: "#07070B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegistration />
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
