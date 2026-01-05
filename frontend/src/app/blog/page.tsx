'use client'

import { useEffect, useState } from 'react'
import { cmsApi, Article } from '@/lib/api/cms'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

const translations = {
  FR: {
    title: 'Blog',
    loading: 'Chargement...',
    noArticles: 'Aucun article disponible',
    readMore: 'Lire la suite',
    categories: {
      Blog: 'Blog',
      'Actualités': 'Actualités',
      'Conseils': 'Conseils',
    },
  },
  EN: {
    title: 'Blog',
    loading: 'Loading...',
    noArticles: 'No articles available',
    readMore: 'Read more',
    categories: {
      Blog: 'Blog',
      'Actualités': 'News',
      'Conseils': 'Advice',
    },
  },
}

export default function BlogPage() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await cmsApi.getArticles({ 
          pageSize: 12,
          categorySlug: selectedCategory || undefined,
        })
        setArticles(data.data)
      } catch (error) {
        console.error('Erreur lors du chargement des articles', error)
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [selectedCategory])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t.loading}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          {t.title}
        </h1>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-6 py-2 rounded-lg transition-all ${
              selectedCategory === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Tous
          </button>
          {Object.entries(t.categories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-6 py-2 rounded-lg transition-all ${
                selectedCategory === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {articles.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">{t.noArticles}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="group"
              >
                <article className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-300 h-full flex flex-col">
                  {article.featuredImage && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={article.featuredImage}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="text-sm text-blue-400 font-semibold mb-2">
                      {article.category ? (t.categories[article.category.name as keyof typeof t.categories] || article.category.name) : ''}
                    </span>
                    <h2 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-gray-400 mb-4 flex-grow">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto">
                      <time className="text-sm text-gray-500">
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : ''}
                      </time>
                      <span className="text-blue-400 group-hover:text-blue-300 transition-colors">
                        {t.readMore} →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}




