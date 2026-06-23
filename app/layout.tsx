import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JCC Estudantil',
  description: 'Sistema de gestão da Comissão Estudantil da JCC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}