'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { cmsApi, Article, Resource } from '@/lib/api/cms'
import { FileText, BookOpen, File, ArrowRight, Download, ArrowUpDown } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'
import Image from 'next/image'

const heroImagePath = '/assets/Images/hero.PNG'
const backgroundImagePath = '/assets/Images/ImgHero.jpg'

const translations = {
  FR: {
    title: 'Ressources & Articles',
    subtitle: 'Découvrez nos articles de blog et ressources téléchargeables pour booster votre carrière tech',
    loading: 'Chargement...',
    noContent: 'Aucun contenu disponible',
    articles: 'Articles',
    resources: 'Ressources',
    all: 'Tout',
    download: 'Télécharger',
    downloads: 'téléchargements',
    readMore: 'Lire plus',
    readArticle: 'Lire l\'article',
    minRead: 'min de lecture',
    views: 'vues',
    types: {
      PDF: 'PDF',
      Guide: 'Guide',
      Template: 'Template',
    },
  },
  EN: {
    title: 'Resources & Articles',
    subtitle: 'Discover our blog articles and downloadable resources to boost your tech career',
    loading: 'Loading...',
    noContent: 'No content available',
    articles: 'Articles',
    resources: 'Resources',
    all: 'All',
    download: 'Download',
    downloads: 'downloads',
    readMore: 'Read more',
    readArticle: 'Read article',
    minRead: 'min read',
    views: 'views',
    types: {
      PDF: 'PDF',
      Guide: 'Guide',
      Template: 'Template',
    },
  },
}

const typeIcons = {
  PDF: FileText,
  Guide: BookOpen,
  Template: File,
}

type ContentType = 'all' | 'articles' | 'resources'

export default function ResourcesPage() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const [articles, setArticles] = useState<Article[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [contentType, setContentType] = useState<ContentType>('all')
  const [selectedType, setSelectedType] = useState<string>('')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false)
      }
    }

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilterDropdown])

  const getFilterLabel = () => {
    if (contentType === 'articles') return t.articles
    if (contentType === 'resources') {
      if (selectedType) return t.types[selectedType as keyof typeof t.types] || selectedType
      return t.resources
    }
    return t.all
  }

  const handleDownload = async (resource: Resource) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sil-talents.ma'
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl.replace(/\/api$/, '') : baseUrl
      const downloadUrl = `${apiUrl}/api/cms/resources/${resource.id}/download`
      
      const response = await fetch(downloadUrl)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erreur lors du téléchargement du fichier:', response.status, errorText)
        alert(`Erreur lors du téléchargement: ${response.statusText || 'Une erreur est survenue'}. Veuillez réessayer.`)
        return
      }
      
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors du téléchargement')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const urlParts = resource.fileUrl.split('.')
      const extension = urlParts.length > 1 ? '.' + urlParts[urlParts.length - 1].split('?')[0] : ''
      link.download = resource.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + extension
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      // Re-fetch resources to update download count
      const resourcesData = await cmsApi.getResources({
        pageSize: 20,
        type: selectedType || undefined,
      })
      setResources(resourcesData.data || [])
    } catch (error) {
      console.error('Erreur lors du téléchargement', error)
      alert('Une erreur est survenue lors du téléchargement. Veuillez réessayer.')
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        if (contentType === 'all' || contentType === 'articles') {
          try {
            const articlesData = await cmsApi.getArticles({
              pageSize: 20,
              status: 'Published',
            })
            console.log('Articles récupérés:', articlesData)
            setArticles(articlesData.data || [])
          } catch (error) {
            console.error('Erreur lors du chargement des articles:', error)
            setArticles([])
          }
        } else {
          setArticles([])
        }

        if (contentType === 'all' || contentType === 'resources') {
          try {
            const resourcesData = await cmsApi.getResources({
              pageSize: 20,
              type: selectedType || undefined,
            })
            console.log('Ressources récupérées:', resourcesData)
            setResources(resourcesData.data || [])
          } catch (error) {
            console.error('Erreur lors du chargement des ressources:', error)
            setResources([])
          }
        } else {
          setResources([])
        }
      } catch (error) {
        console.error('Erreur générale lors du chargement', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [contentType, selectedType])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-gray-500" style={{ fontFamily: 'Inter', fontWeight: 200 }}>{t.loading}</p>
      </div>
    )
  }

  const allContent = [
    ...articles.map(article => ({ type: 'article' as const, data: article })),
    ...resources.map(resource => ({ type: 'resource' as const, data: resource })),
  ].sort((a, b) => {
    const dateA = a.type === 'article' 
      ? new Date(a.data.publishedAt || a.data.createdAt).getTime()
      : new Date(a.data.publishedAt || a.data.createdAt).getTime()
    const dateB = b.type === 'article'
      ? new Date(b.data.publishedAt || b.data.createdAt).getTime()
      : new Date(b.data.publishedAt || b.data.createdAt).getTime()
    return dateB - dateA
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section avec image de fond */}
      <section className="relative bg-black text-white overflow-hidden pt-0" style={{ minHeight: '100vh' }}>
        {/* Background Image pleine largeur */}
        <div className="absolute inset-0 z-0 w-full h-full" style={{ minHeight: '100vh' }}>
          <Image
            src={heroImagePath}
            alt="Ressources & Articles"
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
        <div className="relative z-10 mx-auto w-[90%] max-w-[1200px] pt-28 md:pt-32 pb-8">
          {/* En-tête avec titre et filtre */}
          <div className="flex items-start justify-between mb-6 md:mb-8">
            <div className="flex-1">
              {/* Titre */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mb-3 md:mb-4 leading-tight text-left"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  fontSize: 'clamp(38px, 4vw, 56px)',
                  color: '#FFFFFF',
                  marginTop: '100px',
                }}
              >
                {t.title}
              </motion.h1>

              {/* Paragraphe */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="max-w-3xl text-left"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 200,
                  fontSize: 'clamp(14px, 2.4vw, 18px)',
                  lineHeight: '28px',
                  color: '#999999',
                }}
              >
                {t.subtitle}
              </motion.p>
            </div>

            {/* Filtre en haut à droite */}
            <motion.div
              ref={filterRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative ml-4"
              style={{ marginTop: '100px' }}
            >
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0000006B] backdrop-blur-sm text-white hover:bg-[#00000080] transition-all border-0"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 300,
                  fontSize: '14px',
                  borderRadius: '0',
                }}
              >
                <ArrowUpDown className="w-4 h-4" />
                <span>{getFilterLabel()}</span>
              </button>

              {/* Dropdown */}
              {showFilterDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-lg min-w-[200px] z-50">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setContentType('all')
                        setSelectedType('')
                        setShowFilterDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 transition-all ${
                        contentType === 'all'
                          ? 'bg-[#297BFF] text-white'
                          : 'text-[#999999] hover:bg-[#2A2A2A]'
                      }`}
                      style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '14px', borderRadius: '0' }}
                    >
                      {t.all}
                    </button>
                    <button
                      onClick={() => {
                        setContentType('articles')
                        setSelectedType('')
                        setShowFilterDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 transition-all ${
                        contentType === 'articles'
                          ? 'bg-[#297BFF] text-white'
                          : 'text-[#999999] hover:bg-[#2A2A2A]'
                      }`}
                      style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '14px', borderRadius: '0' }}
                    >
                      {t.articles}
                    </button>
                    <button
                      onClick={() => {
                        setContentType('resources')
                        setSelectedType('')
                        setShowFilterDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 transition-all ${
                        contentType === 'resources'
                          ? 'bg-[#297BFF] text-white'
                          : 'text-[#999999] hover:bg-[#2A2A2A]'
                      }`}
                      style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '14px', borderRadius: '0' }}
                    >
                      {t.resources}
                    </button>
                    {contentType === 'resources' && (
                      <div className="border-t border-[#2A2A2A] mt-2 pt-2">
                        {Object.entries(t.types).map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setSelectedType(selectedType === key ? '' : key)
                              setShowFilterDropdown(false)
                            }}
                            className={`w-full text-left px-4 py-2 transition-all ${
                              selectedType === key
                                ? 'bg-[#297BFF] text-white'
                                : 'text-[#999999] hover:bg-[#2A2A2A]'
                            }`}
                            style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '14px', borderRadius: '0' }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Premières cartes dans la section hero */}
          {allContent.length > 0 && (
            <>
              {/* Mobile: grille verticale */}
              <div className="md:hidden grid grid-cols-1 gap-4 pb-2">
                {allContent.slice(0, 6).map((item, index) => {
                if (item.type === 'article') {
                  const article = item.data as Article
                  return (
                    <motion.div
                      key={`article-${article.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="bg-[#0000006B] border border-[#99999924] p-6 flex flex-col text-left transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#00000080] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)]"
                    >
                      <Link href={`/blog/${article.slug}`} className="flex flex-col h-full">
                        <div className="relative mb-3">
                          <h3 className="text-white pr-20" style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '18px' }}>
                            {article.title}
                          </h3>
                          {article.category && (
                            <span className="absolute top-0 right-0 text-sm text-[#297BFF]" style={{ fontFamily: 'Inter', fontWeight: 300 }}>
                              {article.category.name}
                            </span>
                          )}
                        </div>
                        {article.excerpt && (
                          <p className="text-[#999999] mb-4 flex-grow" style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '14px', lineHeight: '22px' }}>
                            {article.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2A2A2A]">
                          <div className="flex items-center gap-2 text-sm text-[#999999]" style={{ fontFamily: 'Inter', fontWeight: 200 }}>
                            <span>{article.readingTime} {t.minRead}</span>
                            <span>• {article.views} {t.views}</span>
                          </div>
                          <span className="text-[#297BFF] flex items-center gap-1" style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '14px' }}>
                            {t.readArticle} <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  )
                } else {
                  const resource = item.data as Resource
                  const Icon = typeIcons[resource.type] || FileText
                  return (
                    <motion.div
                      key={`resource-${resource.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="bg-[#0000006B] border border-[#99999924] p-6 flex flex-col text-left transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#00000080] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)]"
                    >
                      <div className="relative mb-3">
                        <h3 className="text-white pr-20" style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '18px' }}>
                          {resource.title}
                        </h3>
                        <span className="absolute top-0 right-0 text-sm text-[#297BFF]" style={{ fontFamily: 'Inter', fontWeight: 300 }}>
                          {t.types[resource.type] || resource.type}
                        </span>
                      </div>
                      {resource.description && (
                        <p className="text-[#999999] mb-4 flex-grow" style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '14px', lineHeight: '22px' }}>
                          {resource.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2A2A2A]">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-[#297BFF] flex-shrink-0" />
                          <span className="text-sm text-[#999999]" style={{ fontFamily: 'Inter', fontWeight: 200 }}>
                            {resource.downloadCount} {t.downloads}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleDownload(resource)
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-[#297BFF] hover:bg-[#1e5fcc] transition-colors text-white"
                          style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '14px' }}
                        >
                          <Download className="w-4 h-4" />
                          {t.download}
                        </button>
                      </div>
                    </motion.div>
                  )
                }
              })}
              </div>

              {/* Desktop: grille */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {allContent.slice(0, 6).map((item, index) => {
                  if (item.type === 'article') {
                    const article = item.data as Article
                    return (
                      <motion.div
                        key={`article-${article.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="bg-[#0000006B] border border-[#99999924] p-6 md:p-8 flex flex-col text-left transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#00000080] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)]"
                      >
                        <Link href={`/blog/${article.slug}`} className="flex flex-col h-full">
                          <div className="relative mb-4">
                            <h3 className="text-white pr-20" style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '18px' }}>
                              {article.title}
                            </h3>
                            {article.category && (
                              <span className="absolute top-0 right-0 text-sm text-[#297BFF]" style={{ fontFamily: 'Inter', fontWeight: 300 }}>
                                {article.category.name}
                              </span>
                            )}
                          </div>
                          {article.excerpt && (
                            <p className="text-[#999999] mb-4 flex-grow" style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '14px', lineHeight: '22px' }}>
                              {article.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2A2A2A]">
                            <div className="flex items-center gap-2 text-sm text-[#999999]" style={{ fontFamily: 'Inter', fontWeight: 200 }}>
                              <span>{article.readingTime} {t.minRead}</span>
                              <span>• {article.views} {t.views}</span>
                            </div>
                            <span className="text-[#297BFF] flex items-center gap-1" style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '14px' }}>
                              {t.readArticle} <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  } else {
                    const resource = item.data as Resource
                    const Icon = typeIcons[resource.type] || FileText
                    return (
                      <motion.div
                        key={`resource-${resource.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="bg-[#0000006B] border border-[#99999924] p-6 md:p-8 flex flex-col text-left transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#00000080] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)]"
                      >
                        <div className="relative mb-4">
                          <h3 className="text-white pr-20" style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '18px' }}>
                            {resource.title}
                          </h3>
                          <span className="absolute top-0 right-0 text-sm text-[#297BFF]" style={{ fontFamily: 'Inter', fontWeight: 300 }}>
                            {t.types[resource.type] || resource.type}
                          </span>
                        </div>
                        {resource.description && (
                          <p className="text-[#999999] mb-4 flex-grow" style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '14px', lineHeight: '22px' }}>
                            {resource.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2A2A2A]">
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5 text-[#297BFF] flex-shrink-0" />
                            <span className="text-sm text-[#999999]" style={{ fontFamily: 'Inter', fontWeight: 200 }}>
                              {resource.downloadCount} {t.downloads}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              handleDownload(resource)
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#297BFF] hover:bg-[#1e5fcc] transition-colors text-white"
                            style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '14px' }}
                          >
                            <Download className="w-4 h-4" />
                            {t.download}
                          </button>
                        </div>
                      </motion.div>
                    )
                  }
                })}
              </div>
            </>
          )}
        </div>

        {/* Gradient de transition vers la section suivante */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#1A1A1A]" />
      </section>

      {/* Content Section avec même bg que WhySil */}
      <section className="relative text-white overflow-hidden py-12 md:py-16 flex justify-center items-center">
        {/* Background image pleine section avec le même overlay que WhySil */}
        <div className="absolute inset-0 -z-10">
          <Image
            src={backgroundImagePath}
            alt="Background texture"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Overlay sombre identique à WhySil */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(42, 42, 42, 0.65)' }}
          />
          {/* Gradient supplémentaire en haut */}
          <div
            className="absolute inset-x-0 top-0"
            style={{
              height: '30%',
              background: 'linear-gradient(to bottom, #1A1A1A, transparent)',
            }}
          />
          {/* Gradient supplémentaire en bas */}
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: '30%',
              background: 'linear-gradient(to top, #1A1A1A, transparent)',
            }}
          />
        </div>

        {/* Content container */}
        <div className="relative w-[90%] max-w-[1200px] mx-auto">
          {allContent.length === 0 ? (
            <p className="text-center text-[#999999] text-lg" style={{ fontFamily: 'Inter', fontWeight: 200 }}>
              {t.noContent}
            </p>
          ) : allContent.length > 6 ? (
            <>
              {/* Mobile: grille verticale */}
              <div className="md:hidden grid grid-cols-1 gap-4 pb-2">
                {allContent.slice(6).map((item, index) => {
                  if (item.type === 'article') {
                    const article = item.data as Article
                    return (
                      <motion.div
                        key={`article-${article.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="bg-[#0000006B] border border-[#99999924] p-6 text-left flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#00000080] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)]"
                      >
                        <Link href={`/blog/${article.slug}`} className="flex flex-col h-full">
                          <div className="relative mb-3">
                            <h3 className="text-white pr-20" style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '20px' }}>
                              {article.title}
                            </h3>
                            {article.category && (
                              <span className="absolute top-0 right-0 text-sm text-[#297BFF]" style={{ fontFamily: 'Inter', fontWeight: 300 }}>
                                {article.category.name}
                              </span>
                            )}
                          </div>
                          {article.excerpt && (
                            <p className="text-[#999999] mb-4 flex-grow" style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '14px', lineHeight: '22px' }}>
                              {article.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2A2A2A]">
                            <div className="flex items-center gap-2 text-sm text-[#999999]" style={{ fontFamily: 'Inter', fontWeight: 200 }}>
                              <span>{article.readingTime} {t.minRead}</span>
                              <span>• {article.views} {t.views}</span>
                            </div>
                            <span className="text-[#297BFF] flex items-center gap-1" style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '14px' }}>
                              {t.readArticle} <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  } else {
                    const resource = item.data as Resource
                    const Icon = typeIcons[resource.type] || FileText
                    return (
                      <motion.div
                        key={`resource-${resource.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="bg-[#0000006B] border border-[#99999924] p-6 text-left flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#00000080] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)]"
                      >
                        <div className="relative mb-3">
                          <h3 className="text-white pr-20" style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '20px' }}>
                            {resource.title}
                          </h3>
                          <span className="absolute top-0 right-0 text-sm text-[#297BFF]" style={{ fontFamily: 'Inter', fontWeight: 300 }}>
                            {t.types[resource.type] || resource.type}
                          </span>
                        </div>
                        {resource.description && (
                          <p className="text-[#999999] mb-4 flex-grow" style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '14px', lineHeight: '22px' }}>
                            {resource.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2A2A2A]">
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5 text-[#297BFF] flex-shrink-0" />
                            <span className="text-sm text-[#999999]" style={{ fontFamily: 'Inter', fontWeight: 200 }}>
                              {resource.downloadCount} {t.downloads}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              handleDownload(resource)
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#297BFF] hover:bg-[#1e5fcc] transition-colors text-white"
                            style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '14px' }}
                          >
                            <Download className="w-4 h-4" />
                            {t.download}
                          </button>
                        </div>
                      </motion.div>
                    )
                  }
                })}
              </div>

              {/* Desktop: grille */}
              <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {allContent.slice(6).map((item, index) => {
                  if (item.type === 'article') {
                    const article = item.data as Article
                    return (
                      <motion.div
                        key={`article-${article.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="bg-[#0000006B] border border-[#99999924] p-8 flex flex-col text-left transition-all duration-300 ease-in-out hover:-translate-y-2 hover:bg-[#00000080] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)]"
                      >
                        <Link href={`/blog/${article.slug}`} className="flex flex-col h-full">
                          <div className="relative mb-4">
                            <h3 className="text-white pr-24" style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '22px' }}>
                              {article.title}
                            </h3>
                            {article.category && (
                              <span className="absolute top-0 right-0 text-sm text-[#297BFF]" style={{ fontFamily: 'Inter', fontWeight: 300 }}>
                                {article.category.name}
                              </span>
                            )}
                          </div>
                          {article.excerpt && (
                            <p className="text-[#999999] mb-6 flex-grow" style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', lineHeight: '26px' }}>
                              {article.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2A2A2A]">
                            <div className="flex items-center gap-2 text-sm text-[#999999]" style={{ fontFamily: 'Inter', fontWeight: 200 }}>
                              <span>{article.readingTime} {t.minRead}</span>
                              <span>• {article.views} {t.views}</span>
                            </div>
                            <span className="text-[#297BFF] flex items-center gap-1" style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '14px' }}>
                              {t.readArticle} <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  } else {
                    const resource = item.data as Resource
                    const Icon = typeIcons[resource.type] || FileText
                    return (
                      <motion.div
                        key={`resource-${resource.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="bg-[#0000006B] border border-[#99999924] p-8 flex flex-col text-left transition-all duration-300 ease-in-out hover:-translate-y-2 hover:bg-[#00000080] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(41,123,255,0.5)]"
                      >
                        <div className="relative mb-4">
                          <h3 className="text-white pr-24" style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '22px' }}>
                            {resource.title}
                          </h3>
                          <span className="absolute top-0 right-0 text-sm text-[#297BFF]" style={{ fontFamily: 'Inter', fontWeight: 300 }}>
                            {t.types[resource.type] || resource.type}
                          </span>
                        </div>
                        {resource.description && (
                          <p className="text-[#999999] mb-6 flex-grow" style={{ fontFamily: 'Inter', fontWeight: 200, fontSize: '16px', lineHeight: '26px' }}>
                            {resource.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2A2A2A]">
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5 text-[#297BFF] flex-shrink-0" />
                            <span className="text-sm text-[#999999]" style={{ fontFamily: 'Inter', fontWeight: 200 }}>
                              {resource.downloadCount} {t.downloads}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              handleDownload(resource)
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#297BFF] hover:bg-[#1e5fcc] transition-colors text-white"
                            style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '14px' }}
                          >
                            <Download className="w-4 h-4" />
                            {t.download}
                          </button>
                        </div>
                      </motion.div>
                    )
                  }
                })}
              </div>
            </>
          ) : null}
        </div>
      </section>
    </div>
  )
}
