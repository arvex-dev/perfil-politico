import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QUICK_SIZE, questions } from "@/lib/data";
import { buildResult } from "@/lib/result";

// Convite para comparar: não mostra o resultado de quem convidou antes de a pessoa responder, para não influenciar.
export const metadata: Metadata = {
  title: "Compare seu perfil político comigo",
  description: "Responda o teste de 12 eixos feito para o Brasil e veja onde concordamos e discordamos. Sem cadastro.",
  robots: { index: false },
};

export default async function Invite({ params }: PageProps<"/comparar/[code]">) {
  const { code } = await params;
  const r = buildResult(code);
  if (!r) notFound();
  return (
    <div className="pt-10 sm:pt-16 space-y-6">
      <p className="font-mono text-xs uppercase tracking-wider text-muted">Convite</p>
      <h1 className="font-display text-[2.4rem] sm:text-5xl leading-[1.05]">Alguém quer comparar o perfil político com você</h1>
      <p className="text-lg text-muted">
        Responda o teste; no fim aparece onde vocês concordam e discordam. O resultado de quem convidou só aparece
        depois, para não influenciar suas respostas.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/teste?vs=${code}`} className="inline-flex items-center justify-center rounded-full bg-ink text-paper px-7 h-14 text-lg font-semibold">
          Teste completo ({questions.length})
        </Link>
        <Link href={`/teste/rapido?vs=${code}`} className="inline-flex items-center justify-center rounded-full border border-line px-7 h-14 text-lg font-medium hover:border-ink">
          Versão rápida ({QUICK_SIZE})
        </Link>
      </div>
    </div>
  );
}
