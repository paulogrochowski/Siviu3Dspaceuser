import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Siviu3D',
  description: 'Visualização espacial para construção, decoração e comércio visual',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
