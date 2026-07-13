import type { Metadata } from "next";
import "./globals.css";
import {ThemeProvider} from "next-themes";
import {Analytics} from "@vercel/analytics/next";


export const metadata: Metadata = {
  title: "NoFlowCharts Gallery",
  description: "Browse photo albums and event galleries by NoFlowCharts — a creative studio capturing moments worth remembering.",
  icons: {
    icon: [
      {
        url: '/favicons/favicon-light.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicons/favicon-dark.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning={true}
    >
      <body className="min-h-full">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
