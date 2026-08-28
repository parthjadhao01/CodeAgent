import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip";
import AuthProvider from "./provider";

export const metadata: Metadata = {
  title: "Code Agent",
  description:
    "An autonomous engineer that lives in your GitHub repo — plans, edits, tests, and opens pull requests inside its own isolated sandbox.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body className={GeistSans.className}>
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
