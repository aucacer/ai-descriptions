"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Copy, RotateCcw, Sparkles, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AISettings } from "@/components/ai-settings"
import { aiService, DescriptionRequest, productResearchService } from "@/lib/ai-service"

export default function AIDescriptionGenerator() {
  const [productTitle, setProductTitle] = useState("")
  const [generatedDescription, setGeneratedDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [isResearching, setIsResearching] = useState(false)
  const [productColorPalette, setProductColorPalette] = useState<any>(null)
  const [htmlOutput, setHtmlOutput] = useState("")
  const [showHtmlModal, setShowHtmlModal] = useState(false)
  const [step, setStep] = useState<"input" | "editing">("input")
  const [aiSettings, setAiSettings] = useState({
    provider: "openai",
    style: "professional" as DescriptionRequest['style'],
    tone: "friendly" as DescriptionRequest['tone'],
    includeFeatures: true,
    includeShipping: true,
    includeGuarantee: true,
  })

  // AI description generation with research
  const generateDescription = async () => {
    if (!productTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product title",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setIsResearching(true)

    try {
      // Step 1: Research product information
      toast({
        title: "Researching...",
        description: "Gathering product information from multiple sources",
      })

      let researchData;
      try {
        researchData = await productResearchService.researchProduct(productTitle.trim())
        const confidence = researchData?.confidence || 0;
        const confidenceText = confidence > 0.8 ? 'High accuracy' : 
                              confidence > 0.6 ? 'Good accuracy' : 
                              confidence > 0.4 ? 'Moderate accuracy' : 'Basic research';
        
        toast({
          title: "Research Complete",
          description: `Product data gathered with ${confidenceText} (${Math.round(confidence * 100)}% confidence)`,
        })
      } catch (researchError) {
        console.warn("Research failed, using basic generation:", researchError)
        toast({
          title: "Research Limited",
          description: "Using basic generation - consider adding OpenAI API key for full research",
          variant: "default",
        })
      }

      setIsResearching(false)

      // Step 2: Generate description with research data
      const request: DescriptionRequest = {
        productTitle: productTitle.trim(),
        style: aiSettings.style,
        tone: aiSettings.tone,
        includeFeatures: aiSettings.includeFeatures,
        includeShipping: aiSettings.includeShipping,
        includeGuarantee: aiSettings.includeGuarantee,
        researchData: researchData,
      }

      const response = await aiService.generateDescription(request, aiSettings.provider)
      setGeneratedDescription(response.description)
      setStep("editing")

      toast({
        title: "Success!",
        description: `SEO-optimized description generated using ${response.provider}${researchData ? ' with research data' : ''}`,
      })
    } catch (error) {
      console.error("AI generation error:", error)
      toast({
        title: "Error",
        description: "Failed to generate description. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
      setIsResearching(false)
    }
  }

  // Get color palette from research or generate one
  function getColorPalette() {
    if (productColorPalette) {
      return {
        backgrounds: productColorPalette.lightBackgrounds,
        title: productColorPalette.primaryColor,
        text: productColorPalette.textColor
      }
    }
    
    // Fallback to default if no palette generated yet
    return {
      backgrounds: ['#fff', '#f4f8fd'],
      title: '#0066cc',
      text: '#333'
    }
  }

  const convertToHTML = async () => {
    if (!generatedDescription.trim()) {
      toast({
        title: "Error",
        description: "No description to convert",
        variant: "destructive",
      })
      return
    }

    setIsConverting(true)

    try {
      // Helper function to clean title strings and prevent spacing issues
      const cleanTitleString = (str: string): string => {
        return str
          .replace(/^#+\s*/, '')           // Remove leading # and spaces
          .replace(/^\*+\s*/, '')          // Remove leading * and spaces  
          .replace(/\*+$/g, '')            // Remove trailing *
          .replace(/\*+/g, '')             // Remove any asterisks
          .replace(/#+/g, '')              // Remove any hashes
          .replace(/\s+/g, ' ')            // Replace multiple spaces with single space
          .replace(/^\s+|\s+$/g, '')       // Trim leading and trailing spaces
          .replace(/^(.)\s+(.*)$/, '$1$2') // Remove space after first character completely
          .replace(/^(.)\s/, '$1')         // Fix any remaining space after first character
          .trim()
      }

      // Generate color palette based on product during conversion
      toast({
        title: "Generating Colors...",
        description: "Creating product-specific color palette",
      })

      const colorPalette = await productResearchService.generateColorPalette(
        [], // We'll get images from the stored research data if available
        productTitle.trim()
      )
      setProductColorPalette(colorPalette)

      // Get palette for HTML conversion
      const palette = {
        backgrounds: colorPalette.lightBackgrounds,
        title: colorPalette.primaryColor,
        text: colorPalette.textColor
      }

      const lines = generatedDescription.split(/\r?\n/)
      const sections: { title: string; items: string[]; isList: boolean; isTile: boolean }[] = []
      let currentSection: { title: string; items: string[]; isList: boolean; isTile: boolean } | null = null

    // Fixed regex: only match actual section titles with **bold** formatting or # headers
    const sectionTitleRegex = /^(?:#+\s*)?([\u2600-\u26FF\u2700-\u27BF\u2B50-\u2B55\u1F300-\u1F6FF\u1F900-\u1F9FF\u1FA70-\u1FAFF])?\s*\*\*([^*]+?)\*\*:?\s*$|^(#{1,6})\s+(.*?)$/
    const bulletRegex = /^[•♦\-\*]/

    for (let rawLine of lines) {
      const line = rawLine.trim()
      if (!line) continue
      
      // Skip lines that are just dashes or separators
      if (line === '---' || line === '----' || line === '-----') continue
      
      // Section title detection - look for **Title** or emoji + **Title**
      const match = line.match(sectionTitleRegex)
      if (match) {
        if (currentSection) sections.push(currentSection)
        // Extract title from matched groups - fix spacing issues
        let title = ''
        if (match[2]) {
          // Matched **Title** format
          title = match[2].trim()
          if (match[1]) {
            // Add emoji with proper spacing
            const emoji = match[1].trim()
            const isEmoji = /[\u2600-\u26FF\u2700-\u27BF\u2B50-\u2B55\u1F300-\u1F6FF\u1F900-\u1F9FF\u1FA70-\u1FAFF]/.test(emoji)
            title = isEmoji ? `${emoji} ${title}` : `${emoji}${title}`
          }
        } else if (match[4]) {
          // Matched markdown header format (# Header)
          title = match[4].trim()
        }
        
        // Comprehensive title cleanup - remove ALL formatting and fix spacing
        title = cleanTitleString(title)
        currentSection = {
          title,
          items: [],
          isList: false,
          isTile: true,
        }
        continue
      }
      
      // Bullet point - add to current section
      if (bulletRegex.test(line)) {
        if (!currentSection) {
          // Create a generic section for orphaned bullet points
          currentSection = { title: 'Key Features', items: [], isList: true, isTile: true }
        }
        currentSection.isList = true
        const bulletContent = line.replace(bulletRegex, '').trim()
        // Remove any markdown formatting from bullet content
        const cleanBulletContent = bulletContent.replace(/\*\*(.*?)\*\*/g, '$1')
        currentSection.items.push(cleanBulletContent)
        continue
      }
      
      // Hashtags
      if (line.startsWith('#')) {
        if (currentSection) sections.push(currentSection)
        currentSection = { title: '', items: [line], isList: false, isTile: false }
        continue
      }
      
      // Normal paragraph - add to current section
      if (!currentSection) {
        currentSection = { title: '', items: [], isList: false, isTile: false }
      }
      
      // Remove markdown formatting from paragraph content
      const cleanLine = line.replace(/\*\*(.*?)\*\*/g, '$1')
      
      // Check for explicit section headers like "Box Contents", "Key Features", etc.
      const isExplicitHeader = /^(box contents?|key features?|features?|benefits?|contents?|specifications?|specs?|shipping|guarantee|why choose)$/i.test(cleanLine.trim())
      
      // If this looks like a standalone heading or explicit header, make it a section title
      if (isExplicitHeader || (cleanLine.length < 50 && !cleanLine.includes('.') && !cleanLine.includes('!') && !cleanLine.includes('?') && !cleanLine.toLowerCase().includes('pokemon'))) {
        // Push current section if it has content
        if (currentSection.items.length > 0) {
          sections.push(currentSection)
        }
        // Start new section
        currentSection = { title: cleanLine, items: [], isList: false, isTile: true }
      } else {
        currentSection.items.push(cleanLine)
      }
    }
    if (currentSection) sections.push(currentSection)

    // Post-process to intelligently group bullet points that got separated
    const processedSections: { title: string; items: string[]; isList: boolean; isTile: boolean }[] = []
    let i = 0
    while (i < sections.length) {
      const section = sections[i]
      
      // If we have a section with bullet points starting with "-", group consecutive ones
      if (section.title.startsWith('-') && section.items.length === 0) {
        // Determine section name based on content context
        let sectionName = 'Key Features'
        const nextFewItems = sections.slice(i, i + 5).map(s => s.title.toLowerCase())
        
        if (nextFewItems.some(item => item.includes('booster') || item.includes('pack') || item.includes('card') || item.includes('dice') || item.includes('sleeve'))) {
          sectionName = 'Box Contents'
        } else if (nextFewItems.some(item => item.includes('benefit') || item.includes('advantage') || item.includes('why'))) {
          sectionName = 'Benefits'
        } else if (nextFewItems.some(item => item.includes('feature') || item.includes('include'))) {
          sectionName = 'Key Features'
        }
        
        const bulletSection = { title: sectionName, items: [], isList: true, isTile: true }
        
        // Collect consecutive bullet sections but stop at natural breaks
        let currentGroupType = sectionName.toLowerCase()
        
        while (i < sections.length && sections[i].title.startsWith('-')) {
          const item = sections[i].title.substring(1).trim()
          const itemLower = item.toLowerCase()
          
          // Check if this item belongs to a different category
          let itemType = 'feature'
          if (itemLower.includes('booster') || itemLower.includes('pack') || itemLower.includes('card') || 
              itemLower.includes('dice') || itemLower.includes('sleeve') || itemLower.includes('energy') ||
              itemLower.includes('guide') || itemLower.includes('marker') || itemLower.includes('box') ||
              itemLower.includes('code')) {
            itemType = 'content'
          }
          
          // If we're switching from features to contents or vice versa, start a new section
          if ((currentGroupType.includes('feature') && itemType === 'content') ||
              (currentGroupType.includes('content') && itemType === 'feature')) {
            break
          }
          
          bulletSection.items.push(item)
          i++
        }
        processedSections.push(bulletSection)
      } else {
        processedSections.push(section)
        i++
      }
    }

    // Extract the generated product title from the AI response
    function extractGeneratedTitle(description: string): string {
      // Look for bold text at the beginning of the description (likely the generated title)
      // Handle potential whitespace/newlines before the title
      const titleMatch = description.match(/^\s*\*\*(.*?)\*\*/)
      if (titleMatch) {
        return titleMatch[1].trim()
      }
      
      // If no bold title found, try to find the first line that might be a title
      const lines = description.split('\n')
      const firstLine = lines[0]?.trim()
      if (firstLine && firstLine.length > 0 && firstLine.length < 100) {
        // Remove any markdown formatting from the first line
        const cleanTitle = firstLine.replace(/\*\*/g, '').replace(/^#+\s*/, '').trim()
        if (cleanTitle.length > 0) {
          return cleanTitle
        }
      }
      
      // Fallback to the original product title
      return getCleanProductTitle(productTitle)
    }

    // Add a large, bold, emoji-free product title at the top
    function getCleanProductTitle(title: string) {
      // Remove emojis and extra whitespace
      return title.replace(/[\u2600-\u26FF\u2700-\u27BF\u2B50-\u2B55\u1F300-\u1F6FF\u1F900-\u1F9FF\u1FA70-\u1FAFF]/g, '').replace(/\s+/g, ' ').trim()
    }
    
    const generatedTitle = extractGeneratedTitle(generatedDescription)
    const cleanProductTitle = getCleanProductTitle(generatedTitle)

    // Debug logging
    console.log('Generated description:', generatedDescription)
    console.log('Extracted title:', generatedTitle)
    console.log('Clean product title:', cleanProductTitle)
    console.log('Original product title:', productTitle)
    console.log('Parsed sections:', processedSections.map(s => ({ title: s.title, itemCount: s.items.length, isList: s.isList })))

    // Always use the generated title for the top title, or fallback to original if empty
    let topTitle = cleanProductTitle || getCleanProductTitle(productTitle) || productTitle || 'Product Title'
    // Remove the first section if it is exactly the title (not if it is a welcome/intro or contains more text)
    if (
      processedSections.length > 0 &&
      processedSections[0].title &&
      processedSections[0].title.trim().toLowerCase() === generatedTitle.trim().toLowerCase() &&
      processedSections[0].items.length === 0
    ) {
      processedSections.shift();
    }

    // Track tile index for alternating backgrounds
    let tileIdx = 0
    const htmlContent = processedSections.filter(section => {
      // Filter out empty sections or sections with just separators
      return section.title.trim() || section.items.some(item => item.trim() && item !== '---')
    }).map((section) => {
      if (section.isTile) {
        const bgColor = palette.backgrounds[tileIdx % palette.backgrounds.length] || palette.backgrounds[0]
        tileIdx++
        const tileStyle = `background:${bgColor};margin:24px 0;padding:20px 16px;border-radius:8px;border:1px solid #e0e0e0;`
        const titleStyle = `color:${palette.title};font-size:18px;margin-bottom:12px;font-weight:bold;`
        const contentStyle = `line-height:1.6;color:${palette.text};margin-bottom:10px;`
        const listStyle = 'padding-left:20px;margin:0;'
        const liStyle = `margin:8px 0;color:${palette.text};font-size:16px;`
        
        // If the section title is 'Hashtags' (case-insensitive), skip the heading and just show the items
        if (section.title.trim().toLowerCase().replace(/\s+/g, '') === 'hashtags') {
          return `<div style="color:${palette.title};font-weight:bold;margin-top:24px;font-size:16px;text-align:center;">${section.items.join(' ')}</div>`
        }
        
        // Final title cleanup to ensure no spacing issues
        const cleanTitle = cleanTitleString(section.title)
        
        // Debug logging for spacing issues
        if (section.title !== cleanTitle) {
          console.log('Title cleanup:', { original: section.title, cleaned: cleanTitle })
        }
        
        // Skip sections with empty titles and no meaningful content
        if (!cleanTitle.trim() && section.items.length === 0) {
          return ''
        }
        
        if (section.isList && section.items.length > 0) {
          return `<div style="${tileStyle}">
<h3 style="${titleStyle}">${cleanTitle}</h3>
${section.items.map(item => `<p style="margin:5px 0;color:${palette.text};font-size:16px;">• ${item}</p>`).join('\n')}
</div>`
        } else if (section.items.length > 0) {
          return `<div style="${tileStyle}">
<h3 style="${titleStyle}">${cleanTitle}</h3>
${section.items.map(item => `<p style="margin:0;color:${palette.text};font-size:16px;">${item}</p>`).join('\n')}
</div>`
        } else if (cleanTitle.trim()) {
          // Section with title but no content - probably a standalone header
          return `<div style="${tileStyle}">
<h3 style="${titleStyle}">${cleanTitle}</h3>
</div>`
        }
        return ''
      } else if (section.isList && section.items.length > 0) {
        return section.items.map(item => `<p style='margin:5px 0;color:${palette.text};font-size:16px;'>• ${item}</p>`).join('')
      } else if (section.items.length && section.items[0].startsWith('#')) {
        // Just show the hashtags, no heading
        return `<div style="color:${palette.title};font-weight:bold;margin-top:24px;font-size:16px;text-align:center;">${section.items.join(' ')}</div>`
      } else if (section.items.length > 0) {
        const descStyle = `line-height:1.6;color:${palette.text};margin:15px 0;`
        return section.items.map(item => `<p style='${descStyle}'>${item}</p>`).join('')
      }
      return ''
    }).filter(html => html.trim()).join('\n\n')

    // Only show the big bold title at the top (remove the white box tile)
    const fullHTML = `<div style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;">

<div style="font-size:2.2em;font-weight:bold;color:#222;margin-bottom:0.5em;line-height:1.1;">${topTitle}</div>

${htmlContent}

</div>`

      setHtmlOutput(fullHTML)
      setShowHtmlModal(true)
      
      toast({
        title: "Conversion Complete!",
        description: "HTML with product-specific colors ready to copy",
      })
    } catch (error) {
      console.error('HTML conversion error:', error)
      toast({
        title: "Conversion Error",
        description: "Failed to convert to HTML. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConverting(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(htmlOutput)
      } else {
        // Fallback for insecure context or unsupported browsers
        const textArea = document.createElement("textarea")
        textArea.value = htmlOutput
        // Avoid scrolling to bottom
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand("copy")
        textArea.remove()
      }
      toast({
        title: "Copied!",
        description: "HTML code copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const reset = () => {
    setProductTitle("")
    setGeneratedDescription("")
    setHtmlOutput("")
    setStep("input")
    setShowHtmlModal(false)
    setProductColorPalette(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Description Generator</h1>
                <p className="text-sm text-gray-600">Professional eBay listings made simple</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AISettings onSettingsChange={setAiSettings} />
              <Button variant="outline" onClick={reset} className="flex items-center gap-2 bg-transparent">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {step === "input" ? (
          /* Initial Input Screen */
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">Create Professional eBay Descriptions</h2>
              <p className="text-lg text-gray-600 max-w-2xl">
                Save time and boost sales with AI-powered product descriptions that research your product across multiple sources, 
                include SEO optimization, and provide professional formatting for maximum eBay visibility.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <Badge variant="secondary">Web Research</Badge>
                <Badge variant="secondary">SEO Optimized</Badge>
                <Badge variant="secondary">Professional</Badge>
                <Badge variant="secondary">HTML Ready</Badge>
              </div>
            </div>

            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Enter Your Product Title</CardTitle>
                <CardDescription>Provide a clear, descriptive title for your eBay listing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="e.g., Vintage Leather Jacket Men's Size Large Brown"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="text-lg py-6"
                  onKeyPress={(e) => e.key === "Enter" && generateDescription()}
                />
                <Button
                  onClick={generateDescription}
                  disabled={isGenerating || !productTitle.trim()}
                  className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isResearching ? "Researching Product..." : "Generating Description..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate SEO Description
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 w-full">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">AI-Powered</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Advanced AI researches your product across multiple sources and generates compelling, data-driven descriptions.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold">SEO Optimized</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Built-in SEO research and keyword optimization help your listings rank higher in eBay search results.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Copy className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold">HTML Ready</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    One-click conversion to clean HTML code ready for your eBay listing.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Editing Screen */
          <div className="space-y-6">
            {/* Product Title Display */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Generated Product Title</Badge>
                  <span className="font-medium text-gray-900">
                    {(() => {
                      const titleMatch = generatedDescription.match(/^\s*\*\*(.*?)\*\*/)
                      return titleMatch ? titleMatch[1].trim() : productTitle
                    })()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Generated Description Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Description</CardTitle>
                <CardDescription>
                  Review and edit your AI-generated description. Make any adjustments needed before converting to HTML.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={generatedDescription}
                  onChange={(e) => setGeneratedDescription(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Your generated description will appear here..."
                />
                <div className="flex justify-end">
                  <Button
                    onClick={convertToHTML}
                    disabled={isConverting || !generatedDescription.trim()}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isConverting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Convert to HTML
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* HTML Output Modal */}
      <Dialog open={showHtmlModal} onOpenChange={setShowHtmlModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>HTML Code Ready</DialogTitle>
            <DialogDescription>
              Your description has been converted to HTML. Copy the code below and paste it into your eBay listing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">{htmlOutput}</pre>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowHtmlModal(false)}>
                Close
              </Button>
              <Button onClick={copyToClipboard} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
