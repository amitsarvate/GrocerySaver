import "./globals.css";

import type { ReactNode } from "react";

export const metadata = {
  title: "GrocerySaver",
  description: "Plan your groceries for the lowest cost nearby.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
