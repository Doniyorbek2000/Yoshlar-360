import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Yoshlar 360 - Boshqaruv tizimi',
  description: "O'zbekiston yoshlar bilan ishlash platformasi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
