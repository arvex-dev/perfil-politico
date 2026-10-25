// Marca: um mapa de dois eixos com um ponto (a posição da pessoa), em tinta e verde-petróleo.
export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.4" opacity="0.45" />
      <circle cx="15.5" cy="8.5" r="3" fill="var(--accent)" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-[15px] uppercase tracking-wide">Perfil Político</span>
    </span>
  );
}
