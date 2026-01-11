'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { cmsApi, Resource } from '@/lib/api/cms'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, FileText, BookOpen, File } from 'lucide-react'
import Image from 'next/image'

const heroImagePath = '/assets/Images/hero.PNG'

const typeIcons = {
  PDF: FileText,
  Guide: BookOpen,
  Template: File,
}

const translations = {
  FR: {
    loading: 'Chargement...',
    notFound: 'Ressource non trouvée',
    backToResources: 'Retour aux ressources',
    download: 'Télécharger',
    downloads: 'téléchargements',
    publishedAt: 'Publié le',
    type: 'Type',
    description: 'Description',
  },
  EN: {
    loading: 'Loading...',
    notFound: 'Resource not found',
    backToResources: 'Back to resources',
    download: 'Download',
    downloads: 'downloads',
    publishedAt: 'Published on',
    type: 'Type',
    description: 'Description',
  },
}

export default function ResourceDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const { lang } = useLanguage()
  const t = translations[lang]
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    const fetchResource = async () => {
      try {
        const data = await cmsApi.getResourceBySlug(slug)
        setResource(data)
      } catch (error) {
        console.error('Erreur lors du chargement de la ressource', error)
      } finally {
        setLoading(false)
      }
    }
    fetchResource()
  }, [slug])

  const handleDownload = async () => {
    if (!resource) return
    
    try {
      // Utiliser l'endpoint backend qui télécharge directement le fichier
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sil-talents.ma'
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl.replace(/\/api$/, '') : baseUrl
      const downloadUrl = `${apiUrl}/api/cms/resources/${resource.id}/download`
      
      // Extraire l'extension du fichier depuis l'URL
      const urlParts = resource.fileUrl.split('.')
      const extension = urlParts.length > 1 ? '.' + urlParts[urlParts.length - 1].split('?')[0] : ''
      const fileName = resource.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + extension
      
      // Télécharger le fichier via fetch pour mieux contrôler le processus
      const response = await fetch(downloadUrl)
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      // Vérifier si c'est bien un fichier binaire
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        // Si c'est du JSON, c'est une erreur
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors du téléchargement')
      }
      
      // Créer un blob et télécharger
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors du téléchargement', error)
      // En cas d'erreur, ouvrir dans un nouvel onglet comme fallback
      window.open(resource.fileUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p style={{ fontFamily: 'Inter', fontWeight: 200 }}>{t.loading}</p>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Inter', fontWeight: 300 }}>{t.notFound}</h1>
          <Link href="/ressources" className="text-[#297BFF] hover:text-[#1e5fcc]" style={{ fontFamily: 'Inter', fontWeight: 300 }}>
            {t.backToResources}
          </Link>
        </div>
      </div>
    )
  }

  const Icon = typeIcons[resource.type] || FileText

  return (
    <div className="min-h-screen">
      {/* Hero Section avec image de fond */}
      <section className="relative bg-black text-white overflow-hidden pt-0" style={{ minHeight: '60vh' }}>
        {/* Background Image pleine largeur */}
        <div className="absolute inset-0 z-0 w-full h-full" style={{ minHeight: '60vh' }}>
          <Image
            src={heroImagePath}
            alt={resource.title}
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay identique à la hero de la page d'accueil */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
          />
        </div>

        {/* Contenu au-dessus de l'image */}
        <div className="relative z-10 mx-auto w-[90%] max-w-[1200px] min-h-[60vh] flex flex-col justify-center pt-28 md:pt-32 pb-12 md:pb-16">
          {/* Bouton retour */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="mb-8"
          >
            <Link
              href="/ressources"
              className="flex items-center gap-2 text-[#999999] hover:text-white transition-colors"
              style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '14px' }}
            >
              <ArrowLeft className="w-4 h-4" />
              {t.backToResources}
            </Link>
          </motion.div>

          {/* Type et icône */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex items-center gap-4 mb-6"
          >
            <Icon className="w-12 h-12 text-[#297BFF]" />
            <span className="text-[#297BFF]" style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '16px' }}>
              {resource.type}
            </span>
            {resource.publishedAt && (
              <time className="text-[#999999]" style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '14px' }}>
                {t.publishedAt} {new Date(resource.publishedAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
          </motion.div>

          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-6 leading-tight text-left"
            style={{
              fontFamily: 'Inter',
              fontWeight: 400,
              fontSize: 'clamp(38px, 4vw, 56px)',
              color: '#FFFFFF',
            }}
          >
            {resource.title}
          </motion.h1>

          {/* Statistiques */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex items-center gap-6"
          >
            <span className="text-[#999999]" style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '14px' }}>
              {resource.downloadCount} {t.downloads}
            </span>
          </motion.div>
        </div>

        {/* Gradient de transition vers la section suivante */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#1A1A1A]" />
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-16" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto">
          <div className="max-w-4xl mx-auto">
            {/* Description */}
            {resource.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <h2 className="text-white mb-4" style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '24px' }}>
                  {t.description}
                </h2>
                <p className="text-[#999999]" style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', lineHeight: '26px' }}>
                  {resource.description}
                </p>
              </motion.div>
            )}

            {/* Bouton de téléchargement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-12"
            >
              <button
                onClick={handleDownload}
                className="flex items-center gap-3 px-8 py-4 bg-[#297BFF] hover:bg-[#1e5fcc] rounded-lg transition-colors"
                style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '16px' }}
              >
                <Download className="w-5 h-5" />
                {t.download}
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}



