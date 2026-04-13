const asciidoctor = require('@asciidoctor/core')()
const asciidoctorRevealjs = require('@asciidoctor/reveal.js')
asciidoctorRevealjs.register()

const options = {
  safe: 'unsafe',
  backend: 'revealjs',
  attributes: {
    'revealjsdir': 'node_modules/reveal.js'
  }
}

asciidoctor.convertFile('slides.adoc', options)
console.log('✓ Presentation built: slides.html')
