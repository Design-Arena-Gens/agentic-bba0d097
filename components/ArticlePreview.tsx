'use client'

import { useState } from 'react'

interface ArticlePreviewProps {
  article: any
  isGenerating: boolean
}

export default function ArticlePreview({ article, isGenerating }: ArticlePreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'seo'>('preview')
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportArticle = (format: 'html' | 'markdown' | 'json') => {
    if (!article) return

    let content = ''
    let filename = ''

    switch (format) {
      case 'html':
        content = article.html
        filename = 'article.html'
        break
      case 'markdown':
        content = article.markdown
        filename = 'article.md'
        break
      case 'json':
        content = JSON.stringify(article, null, 2)
        filename = 'article.json'
        break
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isGenerating) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-2xl p-6 flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-xl text-gray-300">Generating your article...</p>
          <p className="text-sm text-gray-400 mt-2">This may take 30-60 seconds</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-2xl p-6 flex items-center justify-center min-h-[600px]">
        <div className="text-center text-gray-400">
          <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg">Your generated article will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-400">Article Preview</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => exportArticle('html')}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            title="Export as HTML"
          >
            HTML
          </button>
          <button
            onClick={() => exportArticle('markdown')}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
            title="Export as Markdown"
          >
            MD
          </button>
          <button
            onClick={() => exportArticle('json')}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
            title="Export as JSON"
          >
            JSON
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-4 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'preview'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setActiveTab('html')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'html'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          HTML Code
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'seo'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          SEO Data
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[700px] overflow-y-auto">
        {activeTab === 'preview' && (
          <div className="prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: article.html }} />
          </div>
        )}

        {activeTab === 'html' && (
          <div className="relative">
            <button
              onClick={() => copyToClipboard(article.html)}
              className="absolute top-2 right-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{article.html}</code>
            </pre>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-4">
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 text-green-400">SEO Score</h3>
              <div className="text-3xl font-bold">{article.seoScore || 'N/A'}/100</div>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 text-purple-400">Meta Tags</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-400">Title:</span>
                  <p className="text-gray-200">{article.metaTags?.title}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-400">Description:</span>
                  <p className="text-gray-200">{article.metaTags?.description}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-400">Keywords:</span>
                  <p className="text-gray-200">{article.metaTags?.keywords}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 text-blue-400">Content Stats</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Word Count:</span>
                  <span className="ml-2 font-medium">{article.stats?.wordCount}</span>
                </div>
                <div>
                  <span className="text-gray-400">Reading Time:</span>
                  <span className="ml-2 font-medium">{article.stats?.readingTime}</span>
                </div>
                <div>
                  <span className="text-gray-400">Headings:</span>
                  <span className="ml-2 font-medium">{article.stats?.headingCount}</span>
                </div>
                <div>
                  <span className="text-gray-400">Images:</span>
                  <span className="ml-2 font-medium">{article.stats?.imageCount}</span>
                </div>
              </div>
            </div>

            {article.affiliateLinks && article.affiliateLinks.length > 0 && (
              <div className="bg-slate-700 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2 text-yellow-400">Affiliate Links</h3>
                <div className="space-y-1 text-sm">
                  {article.affiliateLinks.map((link: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-400">{link.platform}:</span>
                      <span className="text-green-400">{link.count} links</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {article.spellingErrors && article.spellingErrors.length > 0 && (
              <div className="bg-slate-700 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2 text-red-400">Spelling Check</h3>
                <p className="text-sm text-gray-300 mb-2">
                  Found {article.spellingErrors.length} potential issues
                </p>
                <div className="space-y-1 text-sm max-h-40 overflow-y-auto">
                  {article.spellingErrors.slice(0, 10).map((error: any, index: number) => (
                    <div key={index} className="text-gray-400">
                      • {error.word} → {error.suggestions?.join(', ') || 'No suggestions'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
