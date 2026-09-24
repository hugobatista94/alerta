'use client';

interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-[3.75rem] w-full items-center rounded-2xl border px-4 py-2 text-left text-sm font-medium leading-snug transition-colors ${
        selected
          ? 'border-alerta-red bg-alerta-red text-white'
          : 'border-alerta-light/40 bg-transparent text-alerta-light hover:border-alerta-red'
      }`}
    >
      {label}
    </button>
  );
}
