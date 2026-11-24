export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export const isSubpost = (id: string) => id.includes("/")

export const subpostSlug = (id: string) => id.split("/")[1]

export const normalizePath = (pathname: string) => {
  try {
    return decodeURIComponent(pathname).replace(/\/+$/, "")
  } catch {
    return pathname.replace(/\/+$/, "")
  }
}

export const hashId = (hash: string) => decodeURIComponent(hash.slice(1))

// Directory URLs on GitHub Pages redirect unless they end in a slash.
export function ensureTrailingSlash(href: string): string {
  if (!href || href.startsWith("#") || href.startsWith("?") ||
      href.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(href)) {
    return href
  }

  const suffixAt = href.search(/[?#]/)
  const path = suffixAt < 0 ? href : href.slice(0, suffixAt)
  const suffix = suffixAt < 0 ? "" : href.slice(suffixAt)
  if (!path || path.endsWith("/") || /\.[^/]+$/.test(path)) return href
  return `${path}/${suffix}`
}
