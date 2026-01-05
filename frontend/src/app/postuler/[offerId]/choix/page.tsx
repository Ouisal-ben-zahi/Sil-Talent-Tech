'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ApplyChoicePage() {
  const params = useParams<{ offerId: string }>()
  const router = useRouter()
  const offerId = params?.offerId

  if (!offerId) {
    if (typeof window !== 'undefined') {
      router.push('/offres')
    }
    return null
  }

  const quickApplicationHref = `/candidature-rapide?offerId=${offerId}`
  const loginHref = `/candidat/login?redirect=/postuler/${offerId}`

  return (
    <div className="min-h-screen bg-sil-dark relative pt-24 pb-16">
      <section className="section-dark section-padding">
        <div className="container-custom max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-sil-white mb-4">
              Choisissez votre mode de candidature
            </h1>
            <p className="text-sil-light text-lg">
              Pour postuler à cette offre, vous pouvez vous connecter à votre compte candidat
              ou utiliser la candidature rapide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/60 border border-white/10 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-display font-bold text-sil-white mb-2">
                  Me connecter / Créer un compte
                </h2>
                <p className="text-sil-light/80 text-sm mb-4">
                  Accédez à votre tableau de bord, mettez à jour votre profil et suivez vos candidatures.
                </p>
              </div>
              <Link
                href={loginHref}
                className="mt-4 w-full inline-flex items-center justify-center px-6 py-3 bg-sil-accent text-white text-sm font-medium rounded-none hover:shadow-lg transition-all"
              >
                Se connecter / Créer un compte
              </Link>
            </div>

            <div className="bg-black/40 border border-white/10 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-display font-bold text-sil-white mb-2">
                  Candidature rapide
                </h2>
                <p className="text-sil-light/80 text-sm mb-4">
                  Remplissez un formulaire court et uploadez votre CV sans créer de compte.
                </p>
              </div>
              <Link
                href={quickApplicationHref}
                className="mt-4 w-full inline-flex items-center justify-center px-6 py-3 border border-sil-accent text-sil-accent text-sm font-medium rounded-none hover:bg-sil-accent hover:text-white transition-all"
              >
                Continuer sans compte
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}







