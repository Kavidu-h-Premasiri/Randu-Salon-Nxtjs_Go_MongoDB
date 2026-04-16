import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: 'RANDU Salon - Premium Beauty & Grooming Services',
  description: 'Experience luxury beauty treatments at RANDU Salon. Premium hair, nail, and skincare services in an elegant setting.',
  keywords: 'salon, beauty, haircut, styling, luxury salon, grooming, gold salon, premium salon',
  authors: [{ name: 'RANDU Salon' }],
  openGraph: {
    title: 'RANDU Salon - Premium Beauty & Grooming Services',
    description: 'Experience luxury beauty treatments at RANDU Salon. Premium hair, nail, and skincare services in an elegant setting.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}