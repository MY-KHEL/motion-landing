import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const siteUrl = "https://motion-designer-tau.vercel.app";
const description =
  "Ojo Michael is a motion designer. Product films, launch spots, and brand motion for ideas that should be remembered.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ojo Michael · Motion Designer",
    template: "%s · Motion Designer",
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Ojo Michael",
    title: "Ojo Michael · Motion Designer",
    description,
  },
  twitter: {
    card: "summary_large_image",
    site: "@degencrooner",
    creator: "@degencrooner",
    title: "Ojo Michael · Motion Designer",
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Ojo Michael",
              jobTitle: "Motion Designer",
              url: siteUrl,
              description,
              sameAs: ["https://x.com/degencrooner"],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
