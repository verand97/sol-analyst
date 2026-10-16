import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'VORTEX//QUANT — Solana Quantitative ML Terminal',
  description:
    'Full-ecosystem Solana quantitative ML and on-chain analytics terminal. LightGBM microstructure directional model with SHAP explainability and rug-pull detection.',
  keywords: ['Solana', 'Quant', 'ML', 'DeFi', 'Trading', 'LightGBM', 'SHAP', 'On-chain'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} dark`}>
      <body className="bg-[#090A0C] text-[#ECECEF] antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
