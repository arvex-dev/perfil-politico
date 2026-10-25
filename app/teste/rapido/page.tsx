import type { Metadata } from "next";
import Quiz from "@/components/Quiz";

export const metadata: Metadata = { title: "Modo rápido", robots: { index: false } };

export default function Page() {
  return <Quiz mode="rapido" />;
}
