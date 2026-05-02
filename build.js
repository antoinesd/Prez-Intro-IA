const asciidoctor = require('@asciidoctor/core')()
const asciidoctorRevealjs = require('@asciidoctor/reveal.js')
const { generateDiagrams } = require('./scripts/generate-diagrams')
const fs = require('fs')
const path = require('path')

asciidoctorRevealjs.register()

const options = {
  safe: 'unsafe',
  backend: 'revealjs',
  attributes: {
    'revealjsdir': 'node_modules/reveal.js'
  }
}

function build () {
  try {
    generateDiagrams()
    asciidoctor.convertFile('slides.adoc', options)
    const now = new Date().toLocaleTimeString('fr-FR')
    console.log(`[${now}] ✓ Présentation générée : slides.html`)
  } catch (err) {
    console.error('✗ Erreur lors de la génération :', err.message)
  }
}

build()

if (process.argv.includes('--watch')) {
  const WATCH_DIRS = ['.', 'images', 'css', 'diagrams/mermaid']
  const EXTENSIONS = new Set(['.adoc', '.css', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mmd'])

  // Debounce pour éviter les rebuilds multiples en cas de rafale de modifications
  let timer = null
  function scheduleRebuild (filename) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      console.log(`\n→ Modification détectée : ${filename}`)
      build()
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
