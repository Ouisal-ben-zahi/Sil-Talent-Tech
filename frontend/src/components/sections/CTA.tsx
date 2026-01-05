import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="section-light section-padding">
      <div className="container-custom">
        <div className="bg-gradient-to-r from-sil-dark to-sil-black rounded-2xl p-12 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Prêt à transformer votre recrutement tech ?
          </h2>
          <p className="text-xl text-sil-light mb-8 max-w-2xl mx-auto">
            Rejoignez les entreprises qui nous font confiance pour trouver les meilleurs talents.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="btn-primary bg-sil-accent hover:bg-opacity-90 inline-flex items-center justify-center space-x-2"
            >
              <span>Demander une consultation</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/candidature-rapide"
              className="btn-secondary border-white text-white hover:bg-white hover:text-sil-dark inline-flex items-center justify-center space-x-2"
            >
              <span>Déposer mon CV</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}



