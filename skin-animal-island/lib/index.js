/**
 * Animal Island skin — host half.
 *
 * Serves the skin stylesheet, its webfonts and any future image assets from the
 * package over a dedicated prefix route, and injects one head <link> into every
 * index response so the palette is applied at first paint (no flash of the
 * default theme, no client plugin needed).
 *
 * The stylesheet is read from disk on every request (no-store), so editing
 * assets/skin.css and reloading the page is the whole development loop.
 */
import z from '@deepseek-ai/schemastery'
import { readFile } from 'node:fs/promises'
import { extname, join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Directory served by the route. */
const ASSETS = fileURLToPath(new URL('../assets/', import.meta.url))

/** Route prefix; also the base of every URL the stylesheet uses. */
const PREFIX = '/skin-animal-island'

/** Content types for the file kinds this skin ships. */
const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
}

/**
 * Resolve one request path under the asset directory, or undefined when it
 * escapes the directory or names no file.
 * @param pathname - request pathname.
 * @returns absolute file path, or undefined.
 */
function resolveAsset(pathname) {
  let relative
  try {
    relative = decodeURIComponent(pathname.slice(PREFIX.length)).replace(/^\/+/, '')
  } catch {
    return undefined
  }
  if (relative === '' || relative.includes('\0')) return undefined
  const target = join(ASSETS, relative)
  if (!target.startsWith(ASSETS.endsWith(sep) ? ASSETS : `${ASSETS}${sep}`)) return undefined
  return target
}

/**
 * Answer one GET/HEAD request for a skin asset.
 * @param request - fetch request.
 * @returns the file response, or 404.
 */
async function resource(request) {
  const target = resolveAsset(new URL(request.url).pathname)
  if (target === undefined) return new Response('not found', { status: 404 })
  try {
    const body = await readFile(target)
    return new Response(body, {
      headers: {
        'content-type': CONTENT_TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
      },
    })
  } catch {
    return new Response('not found', { status: 404 })
  }
}

export const name = 'skin-animal-island'

/** The web server owns the route table and the index injection table. */
export const inject = ['webServer']

/** Volatile config: toggling in the Plugins page persists to the profile patch. */
export const Config = z.object({
  enabled: z.boolean().default(true).description('Enable the Animal Island skin (reload the page after changing)').volatile(),
})

/**
 * Register the asset route and the stylesheet link injection.
 * @param ctx - host plugin context.
 */
export function apply(ctx, config) {
  ctx.webServer.register({ kind: 'prefix', path: PREFIX, resource })
  ctx.effect(() => ctx.on('webserver/index-inject', (table) => {
    // The client half reads this row before it registers anything, so one flag
    // turns both halves off; the stylesheet link is skipped outright.
    table.push({ kind: 'global', name: '__DSH_SKIN_ANIMAL_ISLAND__', value: { enabled: config.enabled.get() } })
    if (!config.enabled.get()) return
    table.push({
      kind: 'html',
      placement: 'head',
      html: `<link rel="stylesheet" href="${PREFIX}/skin.css" data-dsh-skin="animal-island">`,
    })
  }), 'skin-animal-island: stylesheet link')
}
