import "./globals.css";
import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import { ProfileProvider } from "@/lib/store";
import Shell from "@/components/Shell";

const serif = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WealthLens — financial literacy & planning",
  description: "Learn investing, see your portfolio, stress-test it, and explore your future paths — powered by real market data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <ProfileProvider>
          <Shell>{children}</Shell>
        </ProfileProvider>
      </body>
    </html>
  );
}
