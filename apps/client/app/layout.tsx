import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  weight: ["100", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Buddy Script - Social Network",
  description: "A professional social network for connect people.",
  icons: {
    icon: "/assets/images/logo-copy.svg",
  }
};

import { Providers } from "../src/context/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        {/* Bootstrap */}
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        {/* Common Css */}
        <link rel="stylesheet" href="/assets/css/common.css" />
        {/* Custom Css */}
        <link rel="stylesheet" href="/assets/css/main.css" />
        {/* Responsive Css */}
        <link rel="stylesheet" href="/assets/css/responsive.css" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
        <Toaster position="top-center" />
        {/* Scripts */}
        <script src="/assets/js/bootstrap.bundle.min.js" defer></script>
      </body>
    </html>
  );
}

