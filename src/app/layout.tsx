import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "../styles/globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doctora AngelaP",
  description: "Productos farmacéuticos y estéticos, sin vueltas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream-100 text-ink font-sans">
        {children}
      </body>
    </html>
  );
}