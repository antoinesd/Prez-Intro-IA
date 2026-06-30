# Présentation — Introduction à l'Intelligence Artificielle

Slides RevealJS + Asciidoctor pour une conférence d'~1h destinée à des élèves ingénieurs en chimie (Chimie ParisTech PSL, Bac+5 / doctorants).

## Contenu

| Partie | Thème | Slides |
|--------|-------|--------|
| 1 | Histoire de l'IA — des systèmes experts aux LLMs | ~10 |
| 2 | Les Transformers — comment ça marche vraiment | ~8 |
| 3 | L'IA en chimie — AlphaFold, drug discovery, matériaux | ~8 |
| 4 | Le futur — raisonnement, agents, AGI | ~6 |

## Prérequis

- [Node.js](https://nodejs.org/) ≥ 18

## Installation

```bash
npm install
```

## Build

### Build standard
```bash
npm run build
```
Génère `slides.html` avec styles CSS intégrés (auto-porteur).

### Build portable (standalone)
```bash
npm run build:portable
```
Génère `slides-portables.html` — un fichier HTML unique et autonome contenant tous les styles, scripts et images (sauf CDN externes). Parfait pour partager ou archiver.

### Build PDF
```bash
npm run build:pdf
```
Génère `slides.pdf` (requiert Playwright).

### Build complet
```bash
npm run build:all
```
Produit `slides.html`, `slides.pdf` et `slides-portables.html` en une seule commande.

## Affichage

Ouvrir `slides.html` ou `slides-portables.html` dans un navigateur (Firefox, Chrome). Pour éviter les restrictions CORS sur les images SVG locales, servir via un serveur HTTP :

```bash
npx http-server . -p 8080 -o slides.html
```

## Navigation dans la présentation

| Touche | Action |
|--------|--------|
| `→` / `Espace` | Slide suivant |
| `←` | Slide précédent |
| `S` | Mode présentateur (notes) |
| `F` | Plein écran |
| `Esc` | Vue d'ensemble |
| `?` | Aide |

## Structure

```
├── slides.adoc          # Source Asciidoctor principale
├── build.js             # Script de build (asciidoctor-revealjs)
├── package.json
├── css/
│   └── chimie-paristech.css  # Thème CSS Chimie ParisTech PSL
└── images/
    ├── *.svg            # Diagrammes pédagogiques SVG
    └── ...
```

## Thème CSS

Le thème `css/chimie-paristech.css` utilise la palette Chimie ParisTech PSL :
- Bleu foncé `#0a1628` (fond)
- Bleu vif `#1e5fa8` / `#3d8ef0` (éléments)
- Or `#f5c518` (accents, titres de section)
- Vert `#00b09b` (succès, chimie)

Police : [Inter](https://fonts.google.com/specimen/Inter) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (code).

