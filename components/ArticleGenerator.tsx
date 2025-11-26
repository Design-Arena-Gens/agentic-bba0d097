'use client'

import { useState } from 'react'

interface ArticleGeneratorProps {
  onArticleGenerated: (article: any) => void
  isGenerating: boolean
  setIsGenerating: (value: boolean) => void
}

export default function ArticleGenerator({
  onArticleGenerated,
  isGenerating,
  setIsGenerating
}: ArticleGeneratorProps) {
  const [formData, setFormData] = useState({
    topic: '',
    keywords: '',
    articleType: 'informational',
    productUrl: '',
    targetCountry: 'BR',
    targetLanguage: 'pt-BR',
    wordCount: 1500,
    toneOfVoice: 'professional',
    includeImages: true,
    imageCount: 3,
    affiliateLinks: {
      amazon: '',
      mercadoLivre: '',
      shopee: '',
      magalu: '',
      clickbank: '',
      hotmart: '',
      eduzz: '',
      kiwify: '',
      braip: ''
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate article')
      }

      const data = await response.json()
      onArticleGenerated(data)
    } catch (error) {
      console.error('Error generating article:', error)
      alert('Failed to generate article. Please check your API keys and try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (name.startsWith('affiliate-')) {
      const platform = name.replace('affiliate-', '')
      setFormData(prev => ({
        ...prev,
        affiliateLinks: {
          ...prev.affiliateLinks,
          [platform]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }))
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-2xl p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-400">Article Configuration</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div>
          <label className="block text-sm font-medium mb-2">Article Topic *</label>
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., Best Wireless Headphones 2024"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">SEO Keywords (comma-separated)</label>
          <input
            type="text"
            name="keywords"
            value={formData.keywords}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="wireless headphones, bluetooth, noise cancelling"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Article Type</label>
            <select
              name="articleType"
              value={formData.articleType}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="informational">Informational</option>
              <option value="review">Product Review</option>
              <option value="comparison">Comparison</option>
              <option value="listicle">Listicle</option>
              <option value="how-to">How-To Guide</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Word Count</label>
            <input
              type="number"
              name="wordCount"
              value={formData.wordCount}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              min="500"
              max="5000"
            />
          </div>
        </div>

        {/* GEO Targeting */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Target Country</label>
            <select
              name="targetCountry"
              value={formData.targetCountry}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="BR">Brazil</option>
              <option value="US">United States</option>
              <option value="PT">Portugal</option>
              <option value="ES">Spain</option>
              <option value="MX">Mexico</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              name="targetLanguage"
              value={formData.targetLanguage}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="pt-BR">Portuguese (BR)</option>
              <option value="en-US">English (US)</option>
              <option value="pt-PT">Portuguese (PT)</option>
              <option value="es-ES">Spanish</option>
            </select>
          </div>
        </div>

        {/* Product Review */}
        {formData.articleType === 'review' && (
          <div>
            <label className="block text-sm font-medium mb-2">Product URL (for scraping)</label>
            <input
              type="url"
              name="productUrl"
              value={formData.productUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://www.amazon.com/product-url"
            />
            <p className="text-xs text-gray-400 mt-1">
              Supports: Amazon, Mercado Livre, Shopee, Magalu
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Tone of Voice</label>
          <select
            name="toneOfVoice"
            value={formData.toneOfVoice}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="enthusiastic">Enthusiastic</option>
            <option value="authoritative">Authoritative</option>
          </select>
        </div>

        {/* Image Generation */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="includeImages"
              checked={formData.includeImages}
              onChange={handleChange}
              className="mr-2 w-4 h-4"
            />
            <span className="text-sm">Generate Images (Nano Banana)</span>
          </label>

          {formData.includeImages && (
            <input
              type="number"
              name="imageCount"
              value={formData.imageCount}
              onChange={handleChange}
              className="px-3 py-1 bg-slate-700 rounded focus:ring-2 focus:ring-blue-500 outline-none w-20"
              min="1"
              max="10"
            />
          )}
        </div>

        {/* Affiliate Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-purple-400">Affiliate Links</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {Object.keys(formData.affiliateLinks).map((platform) => (
              <div key={platform}>
                <label className="block text-xs font-medium mb-1 capitalize">
                  {platform === 'mercadoLivre' ? 'Mercado Livre' : platform}
                </label>
                <input
                  type="url"
                  name={`affiliate-${platform}`}
                  value={formData.affiliateLinks[platform as keyof typeof formData.affiliateLinks]}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 bg-slate-700 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={`https://${platform}.com/affiliate-link`}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            isGenerating
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Article...
            </span>
          ) : (
            'Generate Article'
          )}
        </button>
      </form>
    </div>
  )
}
