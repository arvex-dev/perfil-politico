import type { Metadata } from "next";
import Quiz from "@/components/Quiz";

export const metadata: Metadata = {
  title: "Teste político rápido (24 afirmações)",
  description: "Versão rápida do teste político brasileiro: 24 afirmações, cerca de 3 minutos.",
  alternates: { canonical: "/teste/rapido" },
};

export default function Page() {
  return <Quiz mode="rapido" />;
}
