/**
 * Gera um HTML único com o CSS e o JS do build embutidos.
 *
 * Serve para hospedar o app onde só cabe uma página estática, sem assets
 * separados. Rode depois de `npm run build`.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const args = process.argv.slice(2)
/** Sem o invólucro do documento, para hosts que fornecem head e body. */
const fragment = args.includes('--fragment')

const DIST = join(process.cwd(), 'dist')
const OUT = args.find((arg) => !arg.startsWith('--')) ?? join(DIST, 'photoon.html')

const html = readFileSync(join(DIST, 'index.html'), 'utf8')

/** `</script>` dentro de uma string do bundle encerraria a tag cedo demais. */
function safeScript(source) {
  return source.replace(/<\/script/gi, '<\\/script')
}

let output = html

// CSS: <link rel="stylesheet" href="/assets/x.css"> → <style>...</style>
output = output.replace(
  /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/gi,
  (match, href) => {
    if (!href.startsWith('/')) return match // fontes externas continuam por link
    const css = readFileSync(join(DIST, href.slice(1)), 'utf8')
    return `<style>\n${css}\n</style>`
  },
)

// JS: <script type="module" src="/assets/x.js"></script> → <script>...</script>
output = output.replace(
  /<script[^>]*src="([^"]+)"[^>]*><\/script>/gi,
  (match, src) => {
    if (!src.startsWith('/')) return match
    const js = readFileSync(join(DIST, src.slice(1)), 'utf8')
    return `<script type="module">\n${safeScript(js)}\n</script>`
  },
)

if (fragment) {
  const pick = (pattern) => (output.match(pattern) ?? []).join('\n')

  const title = pick(/<title>[\s\S]*?<\/title>/gi)
  const fonts = pick(/<link[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>/gi)
  const styles = pick(/<style>[\s\S]*?<\/style>/gi)
  // O Vite emite o script no <head>, então ele não vem junto com o body.
  const scripts = pick(/<script[^>]*>[\s\S]*?<\/script>/gi)
  const body = output.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? ''

  output = [title, fonts, styles, body.trim(), scripts].filter(Boolean).join('\n')

  if (!scripts) throw new Error('Nenhum script encontrado — o fragmento ficaria inerte.')
}

writeFileSync(OUT, output)

const kb = (Buffer.byteLength(output) / 1024).toFixed(0)
console.log(`${fragment ? 'Fragmento' : 'HTML único'} gerado: ${OUT} (${kb} KB)`)
