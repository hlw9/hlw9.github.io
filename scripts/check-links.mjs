import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

const origin = "https://hlw9.github.io"
const problems = []
let checked = 0

function checkUrl(href, page, source) {
  if (!href || href.startsWith("#") || href.startsWith("?")) return
  const url = new URL(href.replaceAll("&amp;", "&"), new URL(page, origin))
  if (url.origin !== origin) return
  const pathname = url.pathname
  if (!pathname.endsWith("/") && !/\.[^/]+$/.test(pathname)) {
    problems.push(`${source}: ${href}`)
  }
  checked++
}

async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      await scan(file)
    } else if (entry.name.endsWith(".html")) {
      const html = await readFile(file, "utf8")
      const relative = path.relative("dist", file).split(path.sep).join("/")
      const page = `/${relative.replace(/index\.html$/, "")}`
      for (const match of html.matchAll(/<(?:a|link)\b[^>]*\bhref="([^"]*)"[^>]*>/gi)) {
        checkUrl(match[1], page, file)
      }
      for (const match of html.matchAll(/<meta\b[^>]*\bproperty="og:url"[^>]*\bcontent="([^"]*)"[^>]*>/gi)) {
        checkUrl(match[1], page, file)
      }
    }
  }
}

await scan("dist")
const feed = await readFile("dist/rss.xml", "utf8")
for (const match of feed.matchAll(/<link>([^<]+)<\/link>/g)) {
  checkUrl(match[1], "/rss.xml", "dist/rss.xml")
}
if (problems.length) {
  console.error(`Internal directory URLs need trailing slashes:\n${problems.join("\n")}`)
  process.exitCode = 1
} else {
  console.log(`Checked ${checked} internal URLs; directory links end in a slash.`)
}
