'use client'

import { useState } from 'react'
import ArticleGenerator from '@/components/ArticleGenerator'
import ArticlePreview from '@/components/ArticlePreview'

export default function Home() {
  const [generatedArticle, setGeneratedArticle] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            SEO Blog Article Generator
          </h1>
          <p className="text-xl text-gray-300">
            AI-powered content creation with SEO optimization, product reviews & affiliate links
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ArticleGenerator
            onArticleGenerated={setGeneratedArticle}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />

          <ArticlePreview
            article={generatedArticle}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </main>
  )
}
