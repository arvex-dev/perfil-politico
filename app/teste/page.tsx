import type { Metadata } from "next";
import Quiz from "@/components/Quiz";

export const metadata: Metadata = {
  title: "Teste político completo (72 afirmações)",
  description: "Responda 72 afirmações sobre política brasileira e descubra seu alinhamento em 12 eixos.",
  alternates: { canonical: "/teste" },
};

export default function Page() {
  return <Quiz mode="completo" />;
}
