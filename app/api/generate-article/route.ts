import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { scrapeProduct } from '@/lib/productScraper'
import { generateImages } from '@/lib/imageGenerator'
import { injectAffiliateLinks } from '@/lib/affiliateLinkInjector'
import { optimizeSEO } from '@/lib/seoOptimizer'
import { spellCheck } from '@/lib/spellChecker'
import { generateDiscoveryMetadata } from '@/lib/discoveryIntegration'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      topic,
      keywords,
      articleType,
      productUrl,
      targetCountry,
      targetLanguage,
      wordCount,
      toneOfVoice,
      includeImages,
      imageCount,
      affiliateLinks
    } = body

    // Step 1: Scrape product information if it's a review article
    let productData = null
    if (articleType === 'review' && productUrl) {
      try {
        productData = await scrapeProduct(productUrl)
      } catch (error) {
        console.error('Error scraping product:', error)
      }
    }

    // Step 2: Generate article content with ChatGPT
    const systemPrompt = `You are an expert SEO content writer specialized in creating high-quality blog articles in ${targetLanguage} for ${targetCountry} market.

Your task is to write a ${wordCount}-word ${articleType} article with a ${toneOfVoice} tone about: "${topic}".

${keywords ? `Focus on these SEO keywords: ${keywords}` : ''}

${productData ? `Product Information:
- Name: ${productData.name}
- Description: ${productData.description}
- Features: ${productData.features?.join(', ')}
- Technical Specs: ${productData.specs ? JSON.stringify(productData.specs) : 'N/A'}
- Price: ${productData.price}
- Rating: ${productData.rating}
` : ''}

Requirements:
1. Create an engaging, SEO-optimized article
2. Use proper HTML structure with semantic tags (h1, h2, h3, p, ul, ol, strong, em)
3. Include a compelling introduction and conclusion
4. Add relevant subheadings (H2, H3) throughout the article
5. Write in a natural, engaging style that resonates with ${targetCountry} audience
6. Include factual information and maintain credibility
7. For review articles, include pros/cons sections
8. Add call-to-action phrases where affiliate links can be inserted
9. Optimize for featured snippets and Discovery platform
10. Include meta description and title suggestions

Format your response as a complete HTML article (just the body content, no <html> or <body> tags).`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Write the article now. Make it engaging, informative, and optimized for SEO.`
        }
      ],
      temperature: 0.7,
      max_tokens: Math.min(4000, wordCount * 2),
    })

    let articleHtml = completion.choices[0].message.content || ''

    // Step 3: Generate images if requested
    let imageUrls: string[] = []
    if (includeImages && imageCount > 0) {
      try {
        const imagePrompts = generateImagePrompts(topic, imageCount)
        imageUrls = await generateImages(imagePrompts)

        // Insert images into the article
        articleHtml = insertImagesIntoArticle(articleHtml, imageUrls)
      } catch (error) {
        console.error('Error generating images:', error)
      }
    }

    // Step 4: Inject affiliate links
    const activeAffiliateLinks = Object.entries(affiliateLinks)
      .filter(([_, url]) => url)
      .map(([platform, url]) => ({ platform, url: url as string }))

    articleHtml = injectAffiliateLinks(articleHtml, activeAffiliateLinks)

    // Step 5: SEO Optimization
    const seoData = optimizeSEO(articleHtml, keywords, targetLanguage, targetCountry)

    // Step 6: Spell check
    const spellingErrors = spellCheck(articleHtml, targetLanguage)

    // Step 7: Generate Discovery metadata
    const discoveryMetadata = generateDiscoveryMetadata(articleHtml, topic, keywords)

    // Step 8: Calculate stats
    const stats = calculateArticleStats(articleHtml)

    // Step 9: Generate markdown version
    const markdown = htmlToMarkdown(articleHtml)

    return NextResponse.json({
      html: articleHtml,
      markdown,
      metaTags: seoData.metaTags,
      seoScore: seoData.score,
      stats,
      spellingErrors: spellingErrors.slice(0, 20), // Limit to top 20 errors
      affiliateLinks: activeAffiliateLinks.map(link => ({
        platform: link.platform,
        count: (articleHtml.match(new RegExp(link.url, 'g')) || []).length
      })),
      discoveryMetadata,
      productData,
      generatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error generating article:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate article' },
      { status: 500 }
    )
  }
}

function generateImagePrompts(topic: string, count: number): string[] {
  const prompts = []
  prompts.push(`Professional hero image for blog article about ${topic}`)

  for (let i = 1; i < count; i++) {
    prompts.push(`Illustration or infographic related to ${topic}, image ${i + 1}`)
  }

  return prompts
}

function insertImagesIntoArticle(html: string, imageUrls: string[]): string {
  let result = html
  const sections = html.split(/<h2[^>]*>/i)

  imageUrls.forEach((url, index) => {
    const imgTag = `\n<figure class="article-image">
  <img src="${url}" alt="Image ${index + 1}" loading="lazy" />
  <figcaption>Figure ${index + 1}</figcaption>
</figure>\n`

    if (index === 0) {
      // Insert first image after first paragraph
      const firstParagraphEnd = result.indexOf('</p>') + 4
      result = result.slice(0, firstParagraphEnd) + imgTag + result.slice(firstParagraphEnd)
    } else if (sections[index]) {
      // Insert other images before subsequent H2 sections
      const sectionIndex = result.indexOf('<h2', result.indexOf('<h2') + 1)
      if (sectionIndex > -1) {
        result = result.slice(0, sectionIndex) + imgTag + result.slice(sectionIndex)
      }
    }
  })

  return result
}

function calculateArticleStats(html: string): any {
  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const wordCount = textContent.split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200) // Average reading speed
  const headingCount = (html.match(/<h[1-6][^>]*>/gi) || []).length
  const imageCount = (html.match(/<img[^>]*>/gi) || []).length

  return {
    wordCount,
    readingTime: `${readingTime} min`,
    headingCount,
    imageCount,
  }
}

function htmlToMarkdown(html: string): string {
  let markdown = html

  // Convert headings
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')

  // Convert bold and italic
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')

  // Convert links
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')

  // Convert images
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')

  // Convert lists
  markdown = markdown.replace(/<ul[^>]*>/gi, '\n')
  markdown = markdown.replace(/<\/ul>/gi, '\n')
  markdown = markdown.replace(/<ol[^>]*>/gi, '\n')
  markdown = markdown.replace(/<\/ol>/gi, '\n')
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')

  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')

  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '')

  // Clean up extra whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim()

  return markdown
}
