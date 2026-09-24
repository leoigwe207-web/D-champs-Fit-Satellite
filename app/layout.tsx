import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileActionBar from "@/components/MobileActionBar";
import { getSiteSettings } from "@/lib/settings";
import { SITE } from "@/lib/site";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: s.seo_title,
      template: `%s | ${s.brand_name}`,
    },
    description: s.seo_description,
    keywords: [
      "gym in Satellite Town",
      "gym in Chevron Estate",
      "fitness centre Satellite Town Lagos",
      "gym Satellite Town Lagos",
      "personal trainer Satellite Town",
    ],
    openGraph: {
      title: s.seo_title,
      description: s.seo_description,
      type: "website",
      locale: "en_NG",
      siteName: s.brand_name,
      images: [{ url: "/images/Screenshot-2026-09-10-012048.webp" }],
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HealthClub",
    name: SITE.fullName,
    telephone: SITE.phoneIntl,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${SITE.address.line1}, ${SITE.address.line2}`,
      addressLocality: "Satellite Town",
      addressRegion: "Lagos",
      postalCode: "102102",
      addressCountry: "NG",
    },
    openingHours: SITE.openingHours,
    priceRange: "₦₦",
    sameAs: [SITE.instagram, SITE.tiktok].filter(Boolean),
  };

  return (
    <html lang="en" className={`${bebas.variable} ${inter.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <MobileActionBar />
      </body>
    </html>
  );
}
