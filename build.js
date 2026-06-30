const asciidoctor = require('@asciidoctor/core')()
const asciidoctorRevealjs = require('@asciidoctor/reveal.js')
const { generateDiagrams } = require('./scripts/generate-diagrams')
const fs = require('fs')
const path = require('path')
const http = require('http')
const zlib = require('zlib')
const { html: inlineHtmlResources } = require('web-resource-inliner')
const { minify } = require('html-minifier-terser')

asciidoctorRevealjs.register()

const options = {
  safe: 'unsafe',
  backend: 'revealjs',
  attributes: {
    'revealjsdir': 'node_modules/reveal.js'
  }
}

function startStaticServer (rootDir) {
  const server = http.createServer((req, res) => {
    const reqPath = decodeURIComponent((req.url || '/').split('?')[0])
    const filePath = path.resolve(rootDir, `.${reqPath === '/' ? '/slides.html' : reqPath}`)

    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403)
      res.end('Forbidden')
      return
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404)
        res.end('Not found')
        return
      }

      const ext = path.extname(filePath).toLowerCase()
      const contentType = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.json': 'application/json; charset=utf-8',
        '.map': 'application/json; charset=utf-8'
      }[ext] || 'application/octet-stream'

      res.writeHead(200, { 'Content-Type': contentType })
      res.end(data)
    })
  })

  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address()
      resolve({ server, port: addr.port })
    })
  })
}

async function exportPdf (outputFile = 'slides.pdf') {
  let playwright
  try {
    playwright = require('playwright')
  } catch (err) {
    throw new Error('Dépendance manquante: installez playwright pour utiliser --pdf (npm i -D playwright).')
  }

  const rootDir = path.resolve('.')
  const { server, port } = await startStaticServer(rootDir)
  const browser = await playwright.chromium.launch({ headless: true })

  try {
    const page = await browser.newPage()
    await page.goto(`http://127.0.0.1:${port}/slides.html?print-pdf`, { waitUntil: 'networkidle' })

    // Aplatit les piles verticales Reveal.js en slides horizontales pour un PDF linéaire.
    await page.evaluate(() => {
      const deck = document.querySelector('.reveal .slides')
      if (!deck) return

      const directSections = Array.from(deck.children).filter(el => el.tagName === 'SECTION')
      directSections.forEach(section => {
        const nested = Array.from(section.children).filter(el => el.tagName === 'SECTION')
        if (nested.length === 0) return
        nested.forEach(child => deck.insertBefore(child, section))
        section.remove()
      })

      if (window.Reveal && typeof window.Reveal.sync === 'function') {
        window.Reveal.sync()
        window.Reveal.layout()
      }
    })

    await page.pdf({
      path: outputFile,
      printBackground: true,
      preferCSSPageSize: true
    })
  } finally {
    await browser.close()
    await new Promise(resolve => server.close(resolve))
  }
}

function formatBytes (bytes) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`
}

async function exportPortableHtml (inputFile = 'slides.html', outputFile = 'slides.portable.html', { compress = true, gzip = false } = {}) {
  const inputPath = path.resolve(inputFile)
  const outputPath = path.resolve(outputFile)
  const htmlContent = fs.readFileSync(inputPath, 'utf8')

  const inlined = await new Promise((resolve, reject) => {
    inlineHtmlResources({
      fileContent: htmlContent,
      relativeTo: path.dirname(inputPath),
      links: true,
      scripts: true,
      images: true,
      svgs: true,
      strict: false,
      rebaseRelativeTo: path.dirname(inputPath)
    }, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })

  // Certains plugins Reveal restent référencés dans du JS inline (dependencies/src).
  // On remplace ces chemins par des data URI pour garder un livrable monofichier.
  const withEmbeddedPlugins = inlined.replace(/'node_modules\/reveal\.js\/plugin\/([^']+\.js)'/g, (fullMatch, relativePluginPath) => {
    const pluginPath = path.resolve('node_modules/reveal.js/plugin', relativePluginPath)
    if (!fs.existsSync(pluginPath)) return fullMatch
    const pluginCode = fs.readFileSync(pluginPath, 'utf8')
    const dataUri = `data:text/javascript;base64,${Buffer.from(pluginCode, 'utf8').toString('base64')}`
    return `'${dataUri}'`
  })

  const portableRawSize = Buffer.byteLength(withEmbeddedPlugins, 'utf8')

  const portableHtml = compress
    ? await minify(withEmbeddedPlugins, {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      keepClosingSlash: true
    })
    : withEmbeddedPlugins

  fs.writeFileSync(outputPath, portableHtml, 'utf8')

  if (gzip) {
    const gzPath = `${outputPath}.gz`
    fs.writeFileSync(gzPath, zlib.gzipSync(Buffer.from(portableHtml, 'utf8'), { level: zlib.constants.Z_BEST_COMPRESSION }))
  }

  // Signale uniquement les dépendances techniques locales qui devraient être embarquées.
  const unresolved = portableHtml.match(/(?:href|src)=['"](?:node_modules\/|css\/|images\/)/g) || []
  if (unresolved.length > 0) {
    console.warn(`⚠️ Ressources non embarquées détectées (${unresolved.length}). Vérifier ${outputFile}.`)
  }

  const portableSize = fs.statSync(outputPath).size
  const ratio = ((1 - (portableSize / portableRawSize)) * 100).toFixed(1)
  console.log(`ℹ️ Portable (minification): ${formatBytes(portableRawSize)} -> ${formatBytes(portableSize)} (${ratio}% de réduction)`)

  if (gzip) {
    const gzSize = fs.statSync(`${outputPath}.gz`).size
    const gzRatio = ((1 - (gzSize / portableSize)) * 100).toFixed(1)
    console.log(`ℹ️ Gzip (sur portable): ${formatBytes(portableSize)} -> ${formatBytes(gzSize)} (${gzRatio}% de réduction)`)
  }
}

async function build ({ pdf = false, portable = false, portableGzip = false } = {}) {
  try {
    generateDiagrams()
    asciidoctor.convertFile('slides.adoc', options)
    if (pdf) {
      await exportPdf('slides.pdf')
    }
    if (portable) {
      await exportPortableHtml('slides.html', 'slides.portable.html', { compress: true, gzip: portableGzip })
    }
    const now = new Date().toLocaleTimeString('fr-FR')
    const outputs = ['slides.html']
    if (pdf) outputs.push('slides.pdf')
    if (portable) outputs.push('slides.portable.html')
    if (portable && portableGzip) outputs.push('slides.portable.html.gz')
    const out = outputs.join(' + ')
    console.log(`[${now}] ✓ Présentation générée : ${out}`)
  } catch (err) {
    console.error('✗ Erreur lors de la génération :', err.message)
  }
}

const args = new Set(process.argv.slice(2))
const enableWatch = args.has('--watch')
const enablePdf = args.has('--pdf')
const enablePortable = args.has('--portable')
const enablePortableGzip = args.has('--portable-gzip')

build({ pdf: enablePdf, portable: enablePortable, portableGzip: enablePortableGzip })

if (enableWatch) {
  const WATCH_DIRS = ['.', 'images', 'css', 'diagrams/mermaid']
  const EXTENSIONS = new Set(['.adoc', '.css', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mmd'])

  // Debounce pour éviter les rebuilds multiples en cas de rafale de modifications
  let timer = null
  function scheduleRebuild (filename) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      console.log(`\n→ Modification détectée : ${filename}`)
      build({ pdf: enablePdf, portable: enablePortable, portableGzip: enablePortableGzip })
      timer = null
    }, 150)
  }

  WATCH_DIRS.forEach(dir => {
    const absDir = path.resolve(dir)
    if (!fs.existsSync(absDir)) return
    fs.watch(absDir, (eventType, filename) => {
      if (!filename) return
      const ext = path.extname(filename).toLowerCase()
      if (EXTENSIONS.has(ext)) {
        scheduleRebuild(path.join(dir, filename))
      }
    })
    console.log(`👁  Surveillance : ${dir}/`)
  })

  console.log('\nMode watch actif — Ctrl+C pour arrêter.\n')
}
