import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lollipop — Enter the next dimension",
  description: "A futuristic creator media experience."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
