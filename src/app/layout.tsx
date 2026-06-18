import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SERP Checker",
  description: "Check where a page ranks on Google for any keyword.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning: some browser extensions (e.g. ColorZilla
          adds cz-shortcut-listen) mutate <body> before React hydrates. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
