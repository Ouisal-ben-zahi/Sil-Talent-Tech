'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { cmsApi, Article } from '@/lib/api/cms'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { motion } from 'framer-motion'

const backgroundImagePath = '/assets/Images/ImgHero.jpg'

const translations = {
  FR: {
    loading: 'Chargement...',
    notFound: 'Article non trouvé',
    backToBlog: 'Retour au blog',
    categories: {
      Blog: 'Blog',
      'Actualités': 'Actualités',
      'Conseils': 'Conseils',
    },
    minRead: 'min de lecture',
    views: 'vues',
  },
  EN: {
    loading: 'Loading...',
    notFound: 'Article not found',
    backToBlog: 'Back to blog',
    categories: {
      Blog: 'Blog',
      'Actualités': 'News',
      'Conseils': 'Advice',
    },
    minRead: 'min read',
    views: 'views',
  },
}

export default function ArticlePage() {
  const params = useParams()
  const slug = params?.slug as string
  const { lang } = useLanguage()
  const t = translations[lang]
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    const fetchArticle = async () => {
      try {
        const data = await cmsApi.getArticleBySlug(slug)
        setArticle(data)
      } catch (error) {
        console.error('Erreur lors du chargement de l\'article', error)
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p style={{ fontFamily: 'Inter', fontWeight: 200 }}>{t.loading}</p>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Inter', fontWeight: 300 }}>
            {t.notFound}
          </h1>
          <Link href="/blog" className="text-[#297BFF] hover:text-[#1e5fcc]" style={{ fontFamily: 'Inter', fontWeight: 300 }}>
            {t.backToBlog}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <article className="min-h-screen">
      {/* Section avec même style que WhySil */}
      <section className="relative text-white overflow-hidden py-24 md:py-28 flex justify-center items-center">
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
        <div className="relative w-[90%] max-w-4xl mx-auto">
          {/* Catégorie et date */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="mb-6 flex flex-wrap items-center gap-4"
          >
            {article.category && (
              <span className="text-sm text-[#297BFF]" style={{ fontFamily: 'Inter', fontWeight: 300 }}>
                {t.categories[article.category.name as keyof typeof t.categories] || article.category.name}
              </span>
            )}
            {article.publishedAt && (
              <time className="text-sm text-[#999999]" style={{ fontFamily: 'Inter', fontWeight: 200 }}>
                {new Date(article.publishedAt).toLocaleDateString(lang === 'FR' ? 'fr-FR' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
            {article.readingTime && (
              <span className="text-sm text-[#999999]" style={{ fontFamily: 'Inter', fontWeight: 200 }}>
                {article.readingTime} {t.minRead}
              </span>
            )}
            {article.views !== undefined && (
              <span className="text-sm text-[#999999]" style={{ fontFamily: 'Inter', fontWeight: 200 }}>
                {article.views} {t.views}
              </span>
            )}
          </motion.div>

          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-6 md:mb-8 leading-tight"
            style={{
              fontFamily: 'Inter',
              fontWeight: 300,
              fontSize: 'clamp(28px, 5vw, 48px)',
              color: '#FFFFFF',
            }}
          >
            {article.title}
          </motion.h1>

          {/* Image featured */}
          {article.featuredImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative h-64 md:h-96 w-full mb-8 overflow-hidden"
            >
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover"
              />
            </motion.div>
          )}

          {/* Excerpt */}
          {article.excerpt && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-8 md:mb-12 text-[#999999]"
              style={{
                fontFamily: 'Inter',
                fontWeight: 200,
                fontSize: '18px',
                lineHeight: '28px',
                fontStyle: 'italic',
              }}
            >
              {article.excerpt}
            </motion.p>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {article.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs bg-[#1A1A1A] px-3 py-1.5 rounded text-[#999999] border border-[#2A2A2A]"
                  style={{ fontFamily: 'Inter', fontWeight: 200 }}
                >
                  #{tag.name}
                </span>
              ))}
            </motion.div>
          )}

          {/* Contenu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="prose prose-invert prose-lg max-w-none"
            style={{
              fontFamily: 'Inter',
              fontWeight: 200,
              fontSize: '18px',
              lineHeight: '28px',
              color: '#D9D9D9',
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </section>
    </article>
  )
}


