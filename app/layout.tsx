'use client'
import "./globals.css";
import { GameProvider } from "./contexts/gameContexts"; 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}