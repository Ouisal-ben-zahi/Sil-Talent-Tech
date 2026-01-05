'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '@/lib/api'

interface Profile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  linkedin: string | null
  portfolio: string | null
  jobTitle: string | null
  expertiseLevel: string | null
  country: string | null
  city: string | null
}

interface JobOffer {
  id: string
  titre: string
  description: string
  localisation: string | null
  typeContrat: string | null
  niveauExperience: string | null
}

export default function ApplyPage() {
  const params = useParams<{ offerId: string }>()
  const router = useRouter()
  const offerId = params?.offerId

  const [profile, setProfile] = useState<Profile | null>(null)
  const [job, setJob] = useState<JobOffer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!offerId) return

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.replace(`/postuler/${offerId}/choix`)
        return
      }
    }

    const fetchData = async () => {
      try {
        const [profileRes, jobRes] = await Promise.all([
          api.get('/candidates/profile'),
          api.get(`/jobs/${offerId}`),
        ])

        const profileData = profileRes.data.data || profileRes.data
        const jobData = jobRes.data.data || jobRes.data
        setProfile(profileData)
        setJob(jobData)
      } catch (error: any) {
        console.error('Erreur lors du chargement de la candidature:', error)
        if (error.response?.status === 401) {
          router.replace(`/postuler/${offerId}/choix`)
        } else {
          toast.error('Impossible de charger les informations de candidature.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [offerId, router])

  const handleChange = (field: keyof Profile, value: string) => {
    if (!profile) return
    setProfile({ ...profile, [field]: value })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!profile || !offerId) return

    setIsSubmitting(true)
    try {
      // Mettre à jour le profil avec les modifications
      await api.put('/candidates/profile', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        linkedin: profile.linkedin,
        portfolio: profile.portfolio,
        jobTitle: profile.jobTitle,
        expertiseLevel: profile.expertiseLevel,
        country: profile.country,
        city: profile.city,
      })

      // Créer la candidature (le backend utilisera le CV le plus récent)
      await api.post('/applications', { offerId })

      toast.success('Votre candidature a été envoyée avec succès.')
      router.push('/candidat/dashboard')
    } catch (error: any) {
      console.error('Erreur lors de l’envoi de la candidature:', error)
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Erreur lors de l’envoi de la candidature.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !profile || !job) {
    return (
      <div className="min-h-screen bg-sil-dark flex items-center justify-center">
        <p className="text-sil-light">Chargement du formulaire de candidature...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sil-dark relative pt-24 pb-16">
      <section className="section-dark section-padding">
        <div className="container-custom max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-sil-white mb-2">
              Postuler à l&apos;offre
            </h1>
            <p className="text-sil-light text-lg">{job.titre}</p>
            <div className="mt-2 text-sil-light/70 text-sm">
              {job.localisation && <span className="mr-4">{job.localisation}</span>}
              {job.typeContrat && <span className="mr-4">{job.typeContrat}</span>}
              {job.niveauExperience && <span className="capitalize">{job.niveauExperience}</span>}
            </div>
          </div>

          <div className="bg-black/50 border border-white/10 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-sil-light mb-2">Prénom *</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 text-sil-white focus:outline-none focus:ring-2 focus:ring-sil-accent rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-sil-light mb-2">Nom *</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 text-sil-white focus:outline-none focus:ring-2 focus:ring-sil-accent rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-sil-light mb-2">Email *</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sil-light cursor-not-allowed rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-sil-light mb-2">Téléphone *</label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 text-sil-white focus:outline-none focus:ring-2 focus:ring-sil-accent rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-sil-light mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={profile.linkedin || ''}
                    onChange={(e) => handleChange('linkedin', e.target.value)}
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 text-sil-white focus:outline-none focus:ring-2 focus:ring-sil-accent rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-sil-light mb-2">Portfolio / Site web</label>
                  <input
                    type="url"
                    value={profile.portfolio || ''}
                    onChange={(e) => handleChange('portfolio', e.target.value)}
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 text-sil-white focus:outline-none focus:ring-2 focus:ring-sil-accent rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-sil-light mb-2">Poste recherché</label>
                  <input
                    type="text"
                    value={profile.jobTitle || ''}
                    onChange={(e) => handleChange('jobTitle', e.target.value)}
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 text-sil-white focus:outline-none focus:ring-2 focus:ring-sil-accent rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-sil-light mb-2">Ville / Pays</label>
                  <input
                    type="text"
                    value={profile.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 text-sil-white focus:outline-none focus:ring-2 focus:ring-sil-accent rounded-none mb-2"
                  />
                  <input
                    type="text"
                    value={profile.country || ''}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="Pays"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 text-sil-white focus:outline-none focus:ring-2 focus:ring-sil-accent rounded-none"
                  />
                </div>
              </div>

              <p className="text-sm text-sil-light/70">
                Votre CV le plus récent sera utilisé pour cette candidature. Vous pouvez mettre à jour votre CV
                depuis votre tableau de bord candidat.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto bg-sil-accent px-8 py-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 rounded-none text-white"
              >
                <span>{isSubmitting ? 'Envoi de votre candidature...' : 'Envoyer ma candidature'}</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}







