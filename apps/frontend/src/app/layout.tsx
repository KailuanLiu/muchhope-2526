import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Much Hope | Volunteer With Us",
  description:
    "Serving the homeless community in San Jose, CA - providing food, clothing, and hygiene materials through volunteer-driven outreach. Donate today.",
  icons: {
    icon: "color-logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
