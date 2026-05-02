const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const mermaidConfig = path.join('diagrams', 'mermaid', 'theme-config.json')
const mermaidCss = path.join('diagrams', 'mermaid', 'theme.css')

const diagrams = [
  {
    input: path.join('diagrams', 'mermaid', 'beam-search.mmd'),
    output: path.join('images', 'beam_search.svg')
  },
  {
    input: path.join('diagrams', 'mermaid', 'transformer-block.mmd'),
    output: path.join('images', 'transformer_block.svg')
  },
  {
    input: path.join('diagrams', 'mermaid', 'drug-discovery-pipeline.mmd'),
    output: path.join('images', 'drug_discovery_pipeline.svg')
  },
  {
    input: path.join('diagrams', 'mermaid', 'agent-loop.mmd'),
    output: path.join('images', 'agent_loop.svg')
  }
]

function ensureDir (filePath) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function renderOne ({ input, output }) {
  if (!fs.existsSync(input)) {
    throw new Error(`Fichier Mermaid introuvable: ${input}`)
  }
  ensureDir(output)

  const result = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    [
      '--yes',
      'mmdc',
      '-i', input,
      '-o', output,
      '-b', 'transparent',
      '-s', '1.4',
      '-c', mermaidConfig
      ,'-C', mermaidCss
    ],
    { stdio: 'pipe', encoding: 'utf8' }
  )

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `Echec Mermaid pour ${input}`)
  }
}

function generateDiagrams () {
  diagrams.forEach(renderOne)
  console.log(`✓ Diagrammes Mermaid générés (${diagrams.length})`)
}

if (require.main === module) {
  try {
    generateDiagrams()
  } catch (err) {
    console.error('✗ Erreur génération Mermaid:', err.message)
    process.exit(1)
  }
}

module.exports = { generateDiagrams }




