"use client";

import { useState } from "react";

// Compartilhar a imagem em si (stories, status do WhatsApp) quando o aparelho permite; senão, o link com a prévia.
export default function ShareButtons({ code, label, imageVersion }: { code: string; label: string; imageVersion: number }) {
  const [status, setStatus] = useState<string | null>(null);
  const url = () => `${window.location.origin}/r/${code}`;
  const text = `Meu alinhamento político deu "${label}". Faça o teste de 12 eixos feito para o Brasil:`;

  function flash(msg: string) {
    setStatus(msg);
    setTimeout(() => setStatus(null), 2200);
  }

  async function shareImage() {
    try {
      const res = await fetch(`/r/${code}/imagem?v=${imageVersion}`);
      const file = new File([await res.blob()], `perfil-politico.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${text} ${url()}` });
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(file);
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(a.href);
      flash("Imagem baixada");
    } catch {
      // cancelado pela pessoa
    }
  }

  async function invite() {
    const link = `${window.location.origin}/comparar/${code}`;
    const msg = "Compare seu perfil político com o meu:";
    try {
      if (navigator.share) {
        await navigator.share({ text: msg, url: link });
        return;
      }
      await navigator.clipboard.writeText(`${msg} ${link}`);
      flash("Convite copiado");
    } catch {}
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url());
      flash("Link copiado");
    } catch {}
  }

  const ghost = "inline-flex items-center justify-center gap-2 h-12 rounded-full border border-line bg-card px-5 font-medium hover:border-ink";
  return (
    <section className="rounded-[20px] bg-ink text-paper p-5 sm:p-6 space-y-4">
      <div className="space-y-1">
        <h2 className="font-display text-xl">Compartilhe seu perfil</h2>
        <p className="text-sm opacity-75">Imagem pronta para stories e status. O link guarda só sua posição, nunca as respostas.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <button onClick={shareImage} className="inline-flex items-center justify-center h-12 rounded-full bg-paper text-ink px-5 font-semibold hover:opacity-90">
          Compartilhar imagem
        </button>
        <a
          className={`${ghost} !bg-transparent !border-paper/30 hover:!border-paper text-paper`}
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          onClick={(e) => {
            e.currentTarget.href = `https://wa.me/?text=${encodeURIComponent(`${text} ${url()}`)}`;
          }}
          target="_blank"
          rel="noopener noreferrer"
        >
          Enviar no WhatsApp
        </a>
        <button onClick={copy} className={`${ghost} !bg-transparent !border-paper/30 hover:!border-paper text-paper`}>
          Copiar link
        </button>
      </div>
      <button onClick={invite} className="w-full inline-flex items-center justify-center h-12 rounded-full border border-dashed border-paper/40 hover:border-paper px-5 font-medium text-paper">
        Comparar com um amigo
      </button>
      <p className="text-sm min-h-5 opacity-90" role="status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
