import type { Metadata } from "next";
import "./globals.css";
import {ThemeProvider} from "next-themes";

export const metadata: Metadata = {
  title: "NoFlowCharts Gallery",
  description: "Browse photo albums and event galleries by NoFlowCharts — a creative studio capturing moments worth remembering.",
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
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
      >
        <body className="min-h-full">
          {children}
        </body>
      </ThemeProvider>
    </html>
  );
}
