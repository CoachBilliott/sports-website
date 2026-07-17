/** Public URL helper — prefixes NEXT_PUBLIC_BASE_PATH when embedded at /district. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function asset(path: string): string {
  if (!path) return path;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${normalized}`;
}
