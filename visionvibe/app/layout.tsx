import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import { isClerkEnabled } from "@/lib/auth";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vision Vibe — AI Interior Design Studio",
  description:
    "Transform empty rooms into stunning interiors. Pick a theme, style and budget and let free AI image engines art-direct the result.",
  keywords: ["interior design", "AI", "room decoration", "virtual staging", "free AI image"],
  openGraph: {
    title: "Vision Vibe — AI Interior Design Studio",
    description: "Turn an empty room into a designed interior with free AI image engines.",
    type: "website",
  },
};

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('visionvibe-theme') || 'system';
    var dark = stored === 'dark' || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${display.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );

  if (!isClerkEnabled) {
    return content;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
