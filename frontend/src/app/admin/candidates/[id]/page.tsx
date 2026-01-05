'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Download, RefreshCw, Mail, Phone, MapPin, Briefcase, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

interface Candidate {
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
  source: string
  createdAt: string
  cvHistories: Array<{
    id: string
    fileName: string
    uploadedAt: string
    crmSyncStatus: string
    crmSyncDate: string | null
  }>
}

export default function CandidateDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCandidate()
  }, [params.id])

  const fetchCandidate = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(`/admin/candidates/${params.id}`)
      setCandidate(response.data.data)
    } catch (error: any) {
      toast.error('Erreur lors du chargement du candidat')
      router.push('/admin/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadCv = (fileName: string) => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://168.231.82.55:3001/api'}/admin/cvs/${fileName}/download`, '_blank')
  }

  const handleRetrySync = async (cvHistoryId: string) => {
    try {
      await api.post(`/admin/cvs/${cvHistoryId}/retry-sync`)
      toast.success('Nouvelle tentative de synchronisation lancée')
      fetchCandidate()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la synchronisation')
    }
  }

  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen bg-sil-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-sil-dark/70">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!candidate) {
    return null
  }

  return (
    <div className="pt-24 min-h-screen bg-sil-light">
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-sil-dark hover:text-sil-accent transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour</span>
              </button>
            </div>

            {/* Candidate Info */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-display font-bold mb-2">
                    {candidate.firstName} {candidate.lastName}
                  </h1>
                  <p className="text-sil-dark/70">{candidate.email}</p>
                </div>
                <span className="px-4 py-2 bg-sil-accent/10 text-sil-accent rounded-lg font-medium">
                  {candidate.source === 'portal_registration' ? 'Portail' : 'Candidature rapide'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-sil-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-sil-dark/70">Email</p>
                    <p className="font-medium">{candidate.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-sil-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-sil-dark/70">Téléphone</p>
                    <p className="font-medium">{candidate.phone}</p>
                  </div>
                </div>

                {candidate.jobTitle && (
                  <div className="flex items-start space-x-3">
                    <Briefcase className="w-5 h-5 text-sil-accent mt-0.5" />
                    <div>
                      <p className="text-sm text-sil-dark/70">Poste recherché</p>
                      <p className="font-medium">{candidate.jobTitle}</p>
                    </div>
                  </div>
                )}

                {candidate.city && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-sil-accent mt-0.5" />
                    <div>
                      <p className="text-sm text-sil-dark/70">Localisation</p>
                      <p className="font-medium">
                        {candidate.city}, {candidate.country}
                      </p>
                    </div>
                  </div>
                )}

                {candidate.linkedin && (
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 text-sil-accent mt-0.5">in</span>
                    <div>
                      <p className="text-sm text-sil-dark/70">LinkedIn</p>
                      <a
                        href={candidate.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sil-accent hover:underline"
                      >
                        Voir le profil
                      </a>
                    </div>
                  </div>
                )}

                {candidate.portfolio && (
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 text-sil-accent mt-0.5">🌐</span>
                    <div>
                      <p className="text-sm text-sil-dark/70">Portfolio</p>
                      <a
                        href={candidate.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sil-accent hover:underline"
                      >
                        Voir le portfolio
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CV History */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-display font-bold mb-6">Historique des CV</h2>
              <div className="space-y-4">
                {candidate.cvHistories.map((cv) => (
                  <div
                    key={cv.id}
                    className="border border-sil-light rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <FileText className="w-8 h-8 text-sil-accent" />
                      <div>
                        <p className="font-semibold">{cv.fileName}</p>
                        <p className="text-sm text-sil-dark/70">
                          Uploadé le {new Date(cv.uploadedAt).toLocaleDateString('fr-FR')}
                        </p>
                        {cv.crmSyncStatus === 'synced' && cv.crmSyncDate && (
                          <p className="text-sm text-green-600">
                            Synchronisé le {new Date(cv.crmSyncDate).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                        {cv.crmSyncStatus === 'failed' && (
                          <p className="text-sm text-red-600">
                            Échec de synchronisation
                          </p>
                        )}
                        {cv.crmSyncStatus === 'pending' && (
                          <p className="text-sm text-orange-600">
                            En attente de synchronisation
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleDownloadCv(cv.fileName)}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Télécharger</span>
                      </button>
                      {cv.crmSyncStatus !== 'synced' && (
                        <button
                          onClick={() => handleRetrySync(cv.id)}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Renvoyer au CRM</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


