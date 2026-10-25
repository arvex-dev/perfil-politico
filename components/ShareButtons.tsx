"use client";

import { useState } from "react";

export default function ShareButtons({ code, ideology }: { code: string; ideology: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => `${window.location.origin}/r/${code}`;
  const text = `Meu perfil político deu "${ideology}". Faça o teste de 12 eixos feito para o Brasil:`;

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Perfil Político", text, url: url() });
        return;
      } catch {
        // cancelado pela pessoa: cai no copiar
      }
    }
    await copy();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const btn = "rounded-lg px-4 py-2 font-medium transition-colors";
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Compartilhar</h2>
      <div className="flex flex-wrap gap-2">
        <a
          className={`${btn} bg-accent text-white dark:text-black`}
          href={`https://wa.me/?text=${encodeURIComponent(`${text} `)}`}
          onClick={(e) => {
            e.currentTarget.href = `https://wa.me/?text=${encodeURIComponent(`${text} ${url()}`)}`;
          }}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
        <button className={`${btn} border border-line bg-surface`} onClick={share}>
          Compartilhar…
        </button>
        <button className={`${btn} border border-line bg-surface`} onClick={copy}>
          {copied ? "Link copiado" : "Copiar link"}
        </button>
        <a className={`${btn} border border-line bg-surface`} href={`/r/${code}/imagem`} download={`perfil-politico-${code}.png`}>
          Baixar imagem (stories)
        </a>
      </div>
      <p className="text-xs text-muted">
        O link contém só sua posição em cada eixo, não suas respostas. Nada fica guardado no servidor.
      </p>
    </section>
  );
}
