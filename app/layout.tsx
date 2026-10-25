import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { footerHtml } from "@arvex-dev/brand";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Perfil Político", template: "%s · Perfil Político" },
  description:
    "Teste político em 12 eixos calibrado para o Brasil e a América do Sul: economia, costumes, segurança, ambiente, instituições e mais.",
  openGraph: { locale: "pt_BR", siteName: "Perfil Político", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#111318" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <header className="mx-auto w-full max-w-3xl px-4 pt-5 pb-2 flex items-center justify-between text-sm">
          <Link href="/" className="font-semibold tracking-tight">
            Perfil Político
          </Link>
          <Link href="/sobre" className="text-muted hover:text-foreground">
            Metodologia
          </Link>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-12">{children}</main>
        <div className="hidden dark:block" dangerouslySetInnerHTML={{ __html: footerHtml({ tone: "dark", source: "perfil-politico" }) }} />
        <div className="dark:hidden" dangerouslySetInnerHTML={{ __html: footerHtml({ source: "perfil-politico" }) }} />
      </body>
    </html>
  );
}
