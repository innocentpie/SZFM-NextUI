'use client';

import "@/styles/globals.css";

import { AuthProvider } from './authentication/AuthContext';
import './globals.css';

import { Providers } from "./providers";
import { fontSans } from "@/config/fonts";

import clsx from "clsx";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body
        className={clsx(
          "min-h-screen light bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
