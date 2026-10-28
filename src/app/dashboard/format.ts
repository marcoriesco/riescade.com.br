export const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value))
    : "Não informado";

export const formatShortDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("pt-BR") : "—";

export const formatDateTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value))
    : "Não informado";

export const formatAge = (value?: string | null) => {
  if (!value) return "Não informado";
  const createdAt = new Date(value);
  const now = new Date();
  const months = (now.getFullYear() - createdAt.getFullYear()) * 12 + now.getMonth() - createdAt.getMonth();
  if (months < 1) {
    const days = Math.max(1, Math.floor((now.getTime() - createdAt.getTime()) / 86_400_000));
    return `${days} ${days === 1 ? "dia" : "dias"}`;
  }
  if (months < 12) return `${months} ${months === 1 ? "mês" : "meses"}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest
    ? `${years} ${years === 1 ? "ano" : "anos"} e ${rest} ${rest === 1 ? "mês" : "meses"}`
    : `${years} ${years === 1 ? "ano" : "anos"}`;
};

export const formatSize = (bytes?: number | null) => {
  if (!bytes) return null;
  const gb = bytes / 1024 ** 3;
  return gb >= 1 ? `${gb.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} GB` : `${Math.round(bytes / 1024 ** 2)} MB`;
};

/** Seconds -> "12 h 05 min", "8 min", "40 s". */
export const formatPlayTime = (seconds: number) => {
  if (seconds < 60) return seconds > 0 ? `${seconds} s` : "—";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours.toLocaleString("pt-BR")} h ${String(minutes % 60).padStart(2, "0")} min`;
};

/** "há 3 dias" from a local ISO time without zone. */
export const formatRelative = (value: string | null) => {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `há ${days} ${days === 1 ? "dia" : "dias"}`;
  return formatShortDate(value);
};
