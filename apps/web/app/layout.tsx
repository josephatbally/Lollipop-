import type { Metadata } from "next";
import ServiceWorkerRegistration from "./service-worker-registration";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lollipop — Enter the next dimension",
  description: "A futuristic creator media experience.",
  applicationName: "Lollipop",
  manifest: "/manifest.webmanifest",
  themeColor: "#0A0E18",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lollipop"
  },
  icons: {
    icon: "/icons/lollipop.svg",
    apple: "/icons/lollipop.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
