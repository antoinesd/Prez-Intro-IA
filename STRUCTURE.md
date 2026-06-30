# Structure des fichiers AsciiDoc

Le fichier principal `slides.adoc` inclut désormais 6 sous-fichiers en AsciiDoc pour une meilleure organisation :

## Organisation

```
slides.adoc (maître)
├── 00-intro.adoc           # Introduction, bio, sommaire
├── 01-histoire-ia.adoc     # Partie 1 : Histoire de l'IA (1950-2024)
├── 02-transformers.adoc    # Partie 2 : Les Transformers
├── 03-chimie.adoc          # Partie 3 : IA en Chimie
├── 04-futur.adoc           # Partie 4 : Le Futur (Raisonnement, Agents, AGI)
└── 99-conclusion.adoc      # Conclusion et Ressources
```

## Description des sections

### 00-intro.adoc
- Slide titre avec logo Chimie ParisTech
- Bio de l'orateur
- Sommaire avec citation Geoffrey Hinton

### 01-histoire-ia.adoc
- 1950 : Alan Turing et le Test de Turing
- 1956 : Dartmouth Conference
- 1960-1970 : IA symbolique (GOFAI)
- 1980 : Systèmes experts
- 1997 : Deep Blue
- 1986-1995 : Machine Learning et Perceptron
- 2006-2012 : Deep Learning Renaissance
- 2017 : Transformers
- 2020-2024 : Explosion des LLMs

### 02-transformers.adoc
- Intuition : prédire le prochain mot
- Embeddings vectoriels
- Attention et Multi-Head Attention
- Architecture du Transformer
- Génération de texte (Beam Search, Sampling)
- Entraînement et Scaling Laws
- Hallucinations et limites
- Transformers hors texte (vision, protéines, molécules)
- RAG (Retrieval-Augmented Generation)

### 03-chimie.adoc
- AlphaFold : repliement de protéines
- AlphaFold : architecture (Evoformer, Structure Module)
- Drug Discovery accéléré
- Génération de molécules (VAE, GAN, Diffusion)
- Spectroscopie assistée par IA
- Synthèse organique et rétrosynthèse
- Matériaux et énergie
- Self-Driving Labs

### 04-futur.adoc
- Chain-of-Thought et raisonnement
- Reasoning as Test-Time Compute
- Agents IA (architecture, applications)
- AGI : définitions et débats
- Limites techniques
- Défis éthiques et réglementaires

### 99-conclusion.adoc
- Key takeaways (4 points clés)
- Ressources pour aller plus loin
- Questions et contact

## Avantages de cette structure

✅ **Maintenabilité** : chaque section est indépendante et facile à modifier  
✅ **Collaboration** : plusieurs personnes peuvent travailler sur des parties différentes  
✅ **Lisibilité** : la structure est claire et documentée  
✅ **Réutilisabilité** : les fichiers peuvent être utilisés/remixés indépendamment  
✅ **Modularité** : facile d'ajouter/retirer des sections sans toucher au fichier maître  

## Compilation

```bash
npm run build
```

La compilation génère `slides.html` en include tous les fichiers `.adoc` via les directives `:include:` du fichier maître.

