import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import { footerHtml } from "@arvex-dev/brand";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { REPO_URL, SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["500"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Perfil Político", template: "%s · Perfil Político" },
  description:
    "Teste político em 12 eixos feito para o Brasil: economia, costumes, segurança, ambiente, instituições e mais. Sem cadastro, nada é guardado.",
  openGraph: { locale: "pt_BR", siteName: "Perfil Político", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2efe8" },
    { media: "(prefers-color-scheme: dark)", color: "#121316" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${archivo.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <header className="mx-auto w-full max-w-2xl px-4 pt-5 pb-3 flex items-center justify-between">
          <Link href="/" aria-label="Perfil Político, início" className="rounded-md">
            <Logo />
          </Link>
          <nav className="flex items-center text-sm text-muted">
            <Link href="/correntes" className="hover:text-ink rounded-md px-2 py-2">
              Correntes
            </Link>
            <Link href="/sobre" className="hover:text-ink rounded-md px-2 py-2">
              Como funciona
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-14">{children}</main>
        <p className="mx-auto w-full max-w-2xl px-4 pb-2 text-center text-xs text-muted">
          Código, perguntas, fontes e metodologia abertos:{" "}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
            github.com/arvex-dev/perfil-politico
          </a>
        </p>
        <div className="hidden dark:block" dangerouslySetInnerHTML={{ __html: footerHtml({ tone: "dark", source: "perfil-politico" }) }} />
        <div className="dark:hidden" dangerouslySetInnerHTML={{ __html: footerHtml({ source: "perfil-politico" }) }} />
      </body>
    </html>
  );
}
