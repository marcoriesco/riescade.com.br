/** Portable paths relative to one system's ROM directory. */
export function safeRomRelativePath(value: string): boolean {
  return value.length > 0 && value.split("/").every(part =>
    part.length > 0 && part !== "." && part !== ".."
    && !/[\x00-\x1f<>:"\\|?*]/.test(part) && !/[. ]$/.test(part)
    && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part));
}
