export interface AIProvider {
  name: string;
  generateDescription: (request: DescriptionRequest) => Promise<string>;
}

export interface ProductResearchData {
  specifications: string[];
  features: string[];
  marketKeywords: string[];
  productCategories: string[];
  brandInfo: string;
  productImages: string[];
  brand?: string;
  model?: string;
  sku?: string;
  confidence: number;
  sources: string[];
}

export interface ProductSourceData {
  source: string;
  url: string;
  title: string;
  brand?: string;
  model?: string;
  specifications: string[];
  features: string[];
  images: string[];
  structured_data?: any;
  confidence: number;
}

export interface ColorPalette {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  lightBackgrounds: string[];
}

export interface DescriptionRequest {
  productTitle: string;
  style?: 'professional' | 'casual' | 'luxury' | 'technical';
  tone?: 'friendly' | 'formal' | 'enthusiastic' | 'trustworthy';
  includeFeatures?: boolean;
  includeShipping?: boolean;
  includeGuarantee?: boolean;
  researchData?: ProductResearchData;
}

export interface DescriptionResponse {
  description: string;
  provider: string;
  timestamp: Date;
}

// OpenAI Provider
export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || (process.env.OPENAI_API_KEY as string);
    if (!this.apiKey) {
      throw new Error('OpenAI API key is missing. Please set OPENAI_API_KEY as an environment variable.');
    }
  }

  async generateDescription(request: DescriptionRequest): Promise<string> {
    const prompt = this.buildPrompt(request);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert eBay listing description writer. Create compelling, SEO-optimized descriptions that drive sales.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate description with OpenAI');
    }
  }

  private buildPrompt(request: DescriptionRequest): string {
    const { productTitle, style = 'professional', tone = 'friendly', includeFeatures = true, includeShipping = true, includeGuarantee = true, researchData } = request;
    
    let researchContext = '';
    if (researchData) {
      researchContext = `

PRODUCT RESEARCH DATA:
Brand Information: ${researchData.brandInfo}
Product Categories: ${researchData.productCategories.join(', ')}

Key Specifications:
${researchData.specifications.map(spec => `• ${spec}`).join('\n')}

Key Features:
${researchData.features.map(feature => `• ${feature}`).join('\n')}

Market Keywords (use naturally for SEO):
${researchData.marketKeywords.join(', ')}

Use this research data to create accurate, detailed, and SEO-optimized content.`;
    }
    
    return `Create a compelling, in-depth eBay listing description for: "${productTitle}"

Style: ${style}
Tone: ${tone}
${researchContext}

Requirements:
- The FIRST line must be the product title, exactly as provided, in bold markdown (e.g., **${productTitle}**), with no extra words, adjectives, or embellishments.
- Do not add any other words to the product title.
- After the title, continue with the rest of the description as usual.
- Include SEO-optimized keywords naturally from the research data
- Use emojis strategically for visual appeal
- Structure with clear sections using markdown
- Include a dedicated section called "Box Contents" listing everything included in the box (use bullet points)
- Go into detail about unique features, accessories, and what makes this product stand out
- Include bullet points for features and benefits based on research data
- Add relevant hashtags at the end using market keywords
- If research data is available, incorporate specific product details, specifications, and competitive advantages
${includeFeatures ? '- Include key product features and benefits from research data' : ''}
${includeShipping ? '- Mention shipping and delivery information' : ''}
${includeGuarantee ? '- Include satisfaction guarantee' : ''}

Format the response with proper markdown formatting including:
- Product title at the very beginning in bold format, exactly as provided
- Bold headers with emojis (ensure no extra spaces in headers, e.g., **Key Features** not **K ey Features**)
- Bullet point lists
- Hashtags at the end with SEO keywords

IMPORTANT FORMATTING RULES:
- Ensure all headers are properly formatted without extra spaces between characters
- Use clean markdown syntax: **Header** not ** Header** or **H eader**
- Keep emojis attached to headers without extra spaces

Make it engaging, conversion-focused, and as detailed as possible using the research data provided.`;
  }
}

// Mock AI Provider (for development/testing)
export class MockAIProvider implements AIProvider {
  name = 'Mock AI';

  async generateDescription(request: DescriptionRequest): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { productTitle, style = 'professional', tone = 'friendly' } = request;
    
    const styleEmojis = {
      professional: '💼',
      casual: '😊',
      luxury: '✨',
      technical: '🔧'
    };

    const tonePhrases = {
      friendly: 'friendly and approachable',
      formal: 'professional and trustworthy',
      enthusiastic: 'excited and passionate',
      trustworthy: 'reliable and dependable'
    };

    return `**${productTitle}**

${styleEmojis[style]} **Premium Quality & Features:**
This ${productTitle} combines superior craftsmanship with modern functionality, making it the perfect choice for discerning buyers. Whether you're looking for reliability, style, or performance, this item delivers on all fronts.

📦 **Box Contents:**
• Main product unit
• All original accessories
• Instruction manual
• Retail packaging
• Any special inserts or bonus items (if applicable)

✅ **Key Benefits:**
• High-quality construction ensures long-lasting durability
• Versatile design suitable for various applications
• Excellent value for money
• Fast and secure shipping included
• 100% satisfaction guarantee

🚀 **Why Choose This ${productTitle}?**
Our ${productTitle} stands out from the competition with its attention to detail and commitment to excellence. Each item is carefully inspected to meet our high standards before shipping. Enjoy peace of mind knowing you are getting a complete package with everything you need to get started.

📦 **Shipping & Returns:**
• Fast, reliable shipping with tracking
• Secure packaging to ensure safe delivery
• Easy returns within 30 days
• Responsive customer service team

Don't miss out on this amazing ${productTitle}! Order now and experience the difference quality makes. Perfect for personal use or as a thoughtful gift.

#${productTitle.replace(/\s+/g, "")} #QualityProducts #BoxContents #FastShipping #CustomerSatisfaction`;
  }
}

// AI Service Manager
export class AIService {
  private providers: Map<string, AIProvider> = new Map();
  private defaultProvider: string = 'mock';

  constructor() {
    // Register default providers
    this.registerProvider('mock', new MockAIProvider());
  }

  registerProvider(name: string, provider: AIProvider) {
    this.providers.set(name, provider);
  }

  setDefaultProvider(name: string) {
    if (this.providers.has(name)) {
      this.defaultProvider = name;
    }
  }

  async generateDescription(request: DescriptionRequest, providerName?: string): Promise<DescriptionResponse> {
    const provider = this.providers.get(providerName || this.defaultProvider);
    
    if (!provider) {
      throw new Error(`Provider '${providerName || this.defaultProvider}' not found`);
    }

    const description = await provider.generateDescription(request);
    
    return {
      description,
      provider: provider.name,
      timestamp: new Date()
    };
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

// Product Research Service
export class ProductResearchService {
  private static instance: ProductResearchService;
  private openAIApiKey: string = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
  private productImages: string[] = [];

  static getInstance(): ProductResearchService {
    if (!ProductResearchService.instance) {
      ProductResearchService.instance = new ProductResearchService();
    }
    return ProductResearchService.instance;
  }

  // Initialize API key automatically
  private initializeApiKey() {
    if (!this.openAIApiKey) {
      // Try to get from environment variables
      this.openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
    }
  }

  async researchProduct(productTitle: string): Promise<ProductResearchData> {
    try {
      // Ensure API key is initialized
      this.initializeApiKey();
      
      // Get real product data from multiple sources
      const productSources = await this.scrapeProductFromMultipleSources(productTitle);
      
      if (productSources.length > 0) {
        // Cross-validate and merge data from multiple sources
        const validatedData = await this.crossValidateProductData(productSources, productTitle);
        return validatedData;
      }
      
      // Fallback to AI-enhanced research if scraping fails
      return await this.performEnhancedAIResearch(productTitle);
      
    } catch (error) {
      console.error('Product research error:', error);
      // Return default research data if web research fails
      return this.getDefaultResearchData(productTitle);
    }
  }

  private async crossValidateProductData(sources: ProductSourceData[], productTitle: string): Promise<ProductResearchData> {
    try {
      // Merge and validate data from multiple sources
      const mergedData = this.mergeMultiSourceData(sources);
      
      // Use AI to analyze and validate the merged data
      const validationPrompt = `
You are a product data analyst with expertise in technical specifications. Review the following product information collected from multiple sources and create a comprehensive, accurate product profile.

Product: "${productTitle}"

Source Data:
${sources.map((source, index) => `
Source ${index + 1}: ${source.source} (Confidence: ${source.confidence})
Title: ${source.title}
Brand: ${source.brand || 'Not specified'}
Specifications: ${source.specifications.join('; ')}
Features: ${source.features.join('; ')}
`).join('\n')}

Task: Create a unified, accurate product profile by:
1. Cross-referencing information across sources
2. Resolving conflicts by prioritizing higher-confidence sources
3. Extracting only verified, consistent information
4. Identifying the most reliable brand, specifications, and features
5. Filtering out marketing language and focusing on technical facts

Return as JSON:
{
  "specifications": ["verified technical specifications with exact measurements, model numbers, part numbers, compatibility details"],
  "features": ["confirmed specific features that describe actual functionality, not marketing claims"],
  "marketKeywords": ["relevant eBay keywords based on the product data"],
  "productCategories": ["accurate categories based on specifications"],
  "brandInfo": "verified brand information and reputation",
  "brand": "confirmed brand name",
  "model": "product model if identified",
  "confidence": 0.8,
  "sources": ["source names that provided data"]
}

CRITICAL RULES:
- ONLY include specifications that contain numbers, measurements, model numbers, or technical details
- REJECT any specifications that are marketing language (e.g., "high quality", "durable", "premium")
- FEATURES must describe actual functionality, not subjective qualities
- Include exact dimensions (e.g., "12.5 x 8.3 x 2.1 inches"), weights (e.g., "2.4 lbs"), capacities (e.g., "500GB storage")
- Include technical specifications like voltages, frequencies, compatibility standards
- Include model numbers, part numbers, SKUs, version numbers
- Include compatibility information (e.g., "compatible with iPhone 12/13/14")
- Include quantities and contents (e.g., "includes 2 cables, 1 adapter, 1 manual")
- AVOID vague terms like "compact", "portable", "easy to use", "reliable"
- PRIORITIZE information from Amazon and manufacturer specifications over eBay listings
- If conflicting information exists, use the most technically detailed source
`;

      const aiValidation = await this.analyzeWithAI(validationPrompt);
      const validatedData = this.parseResearchData(aiValidation);
      
      // Add the collected product images
      const allImages = sources.flatMap(source => source.images);
      validatedData.productImages = [...new Set(allImages)].slice(0, 5);
      
      return validatedData;
      
    } catch (error) {
      console.error('Cross-validation error:', error);
      // Return merged data without AI validation if AI fails
      return this.mergeMultiSourceData(sources);
    }
  }

  private mergeMultiSourceData(sources: ProductSourceData[]): ProductResearchData {
    const specifications: string[] = [];
    const features: string[] = [];
    const images: string[] = [];
    const sourceNames: string[] = [];
    
    let bestBrand = '';
    let bestBrandConfidence = 0;
    let totalConfidence = 0;
    
    sources.forEach(source => {
      // Collect specifications with higher quality filtering
      source.specifications.forEach(spec => {
        if (spec && spec.length > 5 && spec.length < 200 && !specifications.includes(spec)) {
          // Filter for specific, detailed specifications
          if (this.isSpecificSpecification(spec)) {
            // Clean up the specification
            const cleanSpec = spec.trim()
              .replace(/^[•\-*]\s*/, '') // Remove bullet points
              .replace(/\s+/g, ' ') // Normalize whitespace
              .replace(/^[:\-\s]+|[:\-\s]+$/g, ''); // Remove leading/trailing punctuation
            
            if (cleanSpec.length > 5 && !specifications.includes(cleanSpec)) {
              specifications.push(cleanSpec);
            }
          }
        }
      });
      
      // Collect features with quality filtering
      source.features.forEach(feature => {
        if (feature && feature.length > 5 && feature.length < 200 && !features.includes(feature)) {
          // Filter for unique, specific features
          if (this.isSpecificFeature(feature)) {
            // Clean up the feature
            const cleanFeature = feature.trim()
              .replace(/^[•\-*]\s*/, '') // Remove bullet points
              .replace(/\s+/g, ' ') // Normalize whitespace
              .replace(/^[:\-\s]+|[:\-\s]+$/g, ''); // Remove leading/trailing punctuation
            
            if (cleanFeature.length > 5 && !features.includes(cleanFeature)) {
              features.push(cleanFeature);
            }
          }
        }
      });
      
      // Collect images
      source.images.forEach(img => {
        if (img && !images.includes(img)) {
          images.push(img);
        }
      });
      
      // Track best brand by confidence
      if (source.brand && source.confidence > bestBrandConfidence) {
        bestBrand = source.brand;
        bestBrandConfidence = source.confidence;
      }
      
      // Calculate average confidence
      totalConfidence += source.confidence;
      sourceNames.push(source.source);
    });
    
    const avgConfidence = sources.length > 0 ? totalConfidence / sources.length : 0;
    
    // Sort specifications and features by length (more detailed first)
    const sortedSpecs = specifications.sort((a, b) => b.length - a.length);
    const sortedFeatures = features.sort((a, b) => b.length - a.length);

    return {
      specifications: sortedSpecs.slice(0, 15), // Increased for more detail
      features: sortedFeatures.slice(0, 12), // Increased for more detail
      marketKeywords: this.generateKeywordsFromData(sortedSpecs, sortedFeatures, bestBrand),
      productCategories: this.categorizeProduct(sortedSpecs, sortedFeatures),
      brandInfo: bestBrand ? `${bestBrand} - verified from multiple sources` : 'Brand information gathered from product research',
      productImages: images.slice(0, 5),
      brand: bestBrand,
      confidence: avgConfidence,
      sources: [...new Set(sourceNames)]
    };
  }

  private isSpecificSpecification(spec: string): boolean {
    const lowerSpec = spec.toLowerCase();
    
    // Look for specific indicators of detailed specifications
    const specificIndicators = [
      'dimension', 'size', 'weight', 'material', 'model', 'part', 'number',
      'quantity', 'pack', 'count', 'compatible', 'inch', 'cm', 'gram', 'pound',
      'volt', 'watt', 'amp', 'mhz', 'ghz', 'gb', 'mb', 'capacity', 'resolution',
      'length', 'width', 'height', 'depth', 'diameter', 'thickness', 'volume',
      'watts', 'volts', 'amps', 'ohms', 'hz', 'khz', 'rpm', 'bpm', 'dpi',
      'battery', 'charging', 'connector', 'port', 'socket', 'cable', 'cord',
      'frequency', 'bandwidth', 'speed', 'rate', 'range', 'distance', 'radius',
      'temperature', 'pressure', 'humidity', 'ph', 'conductivity', 'resistance',
      'version', 'revision', 'edition', 'generation', 'series', 'type', 'class',
      'grade', 'standard', 'specification', 'protocol', 'format', 'encoding',
      'compression', 'ratio', 'percentage', 'coefficient', 'factor', 'index'
    ];
    
    // Avoid generic terms and marketing language
    const genericTerms = [
      'high quality', 'excellent', 'amazing', 'great', 'good', 'best',
      'premium', 'superior', 'outstanding', 'perfect', 'ideal', 'ultimate',
      'revolutionary', 'innovative', 'cutting-edge', 'state-of-the-art',
      'world-class', 'industry-leading', 'top-rated', 'award-winning',
      'professional-grade', 'commercial-grade', 'military-grade',
      'beautiful', 'attractive', 'stylish', 'elegant', 'sleek', 'modern',
      'affordable', 'budget-friendly', 'value', 'bargain', 'deal'
    ];
    
    // Must contain numbers, measurements, or technical terms
    const hasNumbers = /\d/.test(spec);
    const hasMeasurements = /\d+\s*(mm|cm|inch|in|ft|m|kg|lb|oz|g|ml|l|gal|°|%)/.test(lowerSpec);
    const hasSpecificIndicators = specificIndicators.some(indicator => lowerSpec.includes(indicator));
    const hasGenericTerms = genericTerms.some(term => lowerSpec.includes(term));
    
    // Additional filters for very specific technical information
    const hasModelNumbers = /[a-z]\d+|[a-z]+-\d+|\d+[a-z]+/i.test(spec);
    const hasPartNumbers = /part\s*#|model\s*#|sku\s*#|p\/n|mpn/i.test(lowerSpec);
    const hasCompatibility = /compatible|works with|fits|designed for/i.test(lowerSpec);
    
    return (hasSpecificIndicators || hasMeasurements || hasModelNumbers || hasPartNumbers || hasCompatibility) 
           && !hasGenericTerms && (hasNumbers || hasModelNumbers || hasPartNumbers);
  }

  private isSpecificFeature(feature: string): boolean {
    const lowerFeature = feature.toLowerCase();
    
    // Look for specific, unique features and functionalities
    const specificFeatureIndicators = [
      'includes', 'contains', 'features', 'equipped', 'compatible', 'supports',
      'design', 'technology', 'system', 'function', 'capability', 'edition',
      'collection', 'series', 'variant', 'version', 'type', 'style',
      'wireless', 'bluetooth', 'wifi', 'usb', 'hdmi', 'ethernet', 'optical',
      'digital', 'analog', 'automatic', 'manual', 'programmable', 'adjustable',
      'rechargeable', 'battery', 'powered', 'cordless', 'wired', 'plug-in',
      'waterproof', 'dustproof', 'shockproof', 'weatherproof', 'outdoor',
      'indoor', 'portable', 'compact', 'foldable', 'stackable', 'modular',
      'led', 'lcd', 'oled', 'touchscreen', 'display', 'monitor', 'screen',
      'memory', 'storage', 'processor', 'cpu', 'gpu', 'ram', 'hard drive',
      'solid state', 'flash', 'card', 'slot', 'expansion', 'upgrade',
      'sensor', 'detector', 'alarm', 'timer', 'remote', 'control', 'voice',
      'smart', 'app', 'software', 'firmware', 'driver', 'plugin', 'extension'
    ];
    
    // Avoid generic marketing terms and vague descriptions
    const genericTerms = [
      'high quality', 'excellent', 'amazing', 'great', 'good', 'best',
      'premium', 'superior', 'outstanding', 'perfect', 'ideal', 'reliable',
      'durable', 'sturdy', 'strong', 'professional', 'heavy duty', 'rugged',
      'beautiful', 'attractive', 'stylish', 'elegant', 'sleek', 'modern',
      'innovative', 'advanced', 'cutting-edge', 'state-of-the-art',
      'world-class', 'industry-leading', 'top-rated', 'award-winning',
      'easy to use', 'user-friendly', 'simple', 'convenient', 'efficient',
      'powerful', 'versatile', 'flexible', 'customizable', 'personalized',
      'affordable', 'budget-friendly', 'value', 'bargain', 'deal', 'cheap'
    ];
    
    // Look for specific functionality descriptions
    const hasFunctionality = /can\s+(be\s+)?(used|operated|configured|connected|controlled|programmed|adjusted|set|activated|turned|switched)/i.test(feature);
    const hasSpecificAction = /automatically|manually|wirelessly|remotely|digitally|electronically|mechanically|hydraulically|pneumatically/i.test(lowerFeature);
    const hasConnectivity = /via|through|using|with|by|connects to|pairs with|works with|compatible with/i.test(lowerFeature);
    const hasSpecificNumbers = /\d+/.test(feature);
    const hasSpecificIndicators = specificFeatureIndicators.some(indicator => lowerFeature.includes(indicator));
    const hasGenericTerms = genericTerms.some(term => lowerFeature.includes(term));
    
    // Feature must be specific and actionable, not just marketing fluff
    const isActionable = hasFunctionality || hasSpecificAction || hasConnectivity;
    const isSpecific = hasSpecificIndicators || hasSpecificNumbers || isActionable;
    
    return isSpecific && !hasGenericTerms;
  }

  private async performEnhancedAIResearch(productTitle: string): Promise<ProductResearchData> {
    if (!this.openAIApiKey) {
      return this.getDefaultResearchData(productTitle);
    }

    try {
      const researchPrompt = `
You are a professional product researcher with access to comprehensive technical databases. Provide accurate, detailed information about: "${productTitle}"

Focus EXCLUSIVELY on factual, technical information you are confident about. Include:
- Specific technical specifications with exact measurements, weights, dimensions
- Key features that describe actual functionality and capabilities
- Brand information and product model details
- Product category classification
- Technical compatibility and requirements

Return as JSON:
{
  "specifications": ["extremely specific technical specs with exact measurements, model numbers, part numbers, technical standards"],
  "features": ["specific functional features that describe what the product actually does or includes"],
  "marketKeywords": ["relevant search keywords based on actual product attributes"],
  "productCategories": ["accurate product categories"],
  "brandInfo": "factual brand information",
  "confidence": 0.7
}

STRICT REQUIREMENTS:
- ONLY include specifications that contain numbers, measurements, or technical details
- REJECT marketing language like "high quality", "premium", "durable", "reliable"
- FEATURES must describe actual functionality, not subjective qualities
- Include exact dimensions, weights, capacities, voltages, frequencies
- Include model numbers, part numbers, version numbers where known
- Include technical standards and compatibility information
- Include specific quantities (e.g., "includes 3 cables", "pack of 12")
- AVOID vague descriptions like "compact", "portable", "easy to use"
- If you don't have specific technical information, don't guess or generalize
- Only provide information you are highly confident is accurate
`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a product research expert with access to comprehensive product databases. Provide accurate, factual information.'
            },
            {
              role: 'user',
              content: researchPrompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.2,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        return this.parseResearchData(aiResponse);
      }
    } catch (error) {
      console.error('Enhanced AI research error:', error);
    }
    
    return this.getDefaultResearchData(productTitle);
  }

  private generateKeywordsFromData(specifications: string[], features: string[], brand: string): string[] {
    const keywords: string[] = [];
    
    // Add brand as keyword
    if (brand) {
      keywords.push(brand.toLowerCase());
    }
    
    // Extract keywords from specifications and features
    const allText = [...specifications, ...features].join(' ').toLowerCase();
    
    // Common product keywords
    const productKeywords = [
      'professional', 'premium', 'quality', 'durable', 'lightweight', 'compact',
      'wireless', 'bluetooth', 'rechargeable', 'waterproof', 'portable',
      'original', 'authentic', 'new', 'sealed', 'fast shipping'
    ];
    
    productKeywords.forEach(keyword => {
      if (allText.includes(keyword) && !keywords.includes(keyword)) {
        keywords.push(keyword);
      }
    });
    
    return keywords.slice(0, 8);
  }

  private categorizeProduct(specifications: string[], features: string[]): string[] {
    const allText = [...specifications, ...features].join(' ').toLowerCase();
    const categories: string[] = [];
    
    // Product category mapping
    const categoryMap = {
      'Electronics': ['electronic', 'digital', 'battery', 'charger', 'wireless', 'bluetooth'],
      'Clothing & Accessories': ['clothing', 'apparel', 'shirt', 'jacket', 'shoes', 'accessory'],
      'Home & Garden': ['home', 'kitchen', 'garden', 'furniture', 'decor'],
      'Sports & Outdoors': ['sport', 'outdoor', 'fitness', 'exercise', 'camping'],
      'Toys & Games': ['toy', 'game', 'puzzle', 'educational', 'children'],
      'Health & Beauty': ['health', 'beauty', 'skincare', 'supplement', 'cosmetic'],
      'Automotive': ['car', 'auto', 'vehicle', 'automotive', 'parts'],
      'Books & Media': ['book', 'dvd', 'cd', 'media', 'music'],
      'Collectibles': ['collectible', 'vintage', 'rare', 'limited', 'antique']
    };
    
    Object.entries(categoryMap).forEach(([category, keywords]) => {
      if (keywords.some(keyword => allText.includes(keyword))) {
        categories.push(category);
      }
    });
    
    return categories.length > 0 ? categories : ['General Merchandise'];
  }

  private async performWebSearch(query: string): Promise<string> {
    try {
      // Get real product data from multiple sources
      const productData = await this.scrapeProductFromMultipleSources(query);
      
      if (productData.length > 0) {
        // Convert structured data to search results format
        return this.convertProductDataToSearchResults(productData, query);
      }
      
      // Fallback to basic search if structured scraping fails
      return await this.performBasicWebSearch(query);
      
    } catch (error) {
      console.error('Web search error:', error);
      return await this.performBasicWebSearch(query);
    }
  }

  private async scrapeProductFromMultipleSources(productTitle: string): Promise<ProductSourceData[]> {
    const sources: ProductSourceData[] = [];
    
    // Define target sources for accurate product data
    const searchSources = [
      {
        name: 'Google Shopping',
        searchUrl: `https://www.google.com/search?q=${encodeURIComponent(productTitle + ' specs')}&tbm=shop`,
        parser: this.parseGoogleShopping.bind(this)
      },
      {
        name: 'Amazon',
        searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(productTitle)}`,
        parser: this.parseAmazonProduct.bind(this)
      },
      {
        name: 'eBay',
        searchUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(productTitle)}`,
        parser: this.parseEbayProduct.bind(this)
      }
    ];

    // Scrape from each source
    for (const source of searchSources) {
      try {
        const productData = await this.scrapeProductSource(source.searchUrl, source.name, source.parser);
        if (productData) {
          sources.push(productData);
        }
      } catch (error) {
        console.log(`Failed to scrape ${source.name}:`, error);
      }
    }

    return sources;
  }

  private async scrapeProductSource(
    url: string, 
    sourceName: string, 
    parser: (html: string, url: string) => ProductSourceData | null
  ): Promise<ProductSourceData | null> {
    try {
      // Try direct fetch first
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        const html = await response.text();
        return parser(html, url);
      }
    } catch (error) {
      console.log(`Direct fetch failed for ${sourceName}, trying alternative approach:`, error);
      
      // Fallback: Use AI to research the product instead of web scraping
      if (this.openAIApiKey) {
        return await this.aiBasedProductResearch(url, sourceName);
      }
    }
    
    return null;
  }

  private async aiBasedProductResearch(url: string, sourceName: string): Promise<ProductSourceData | null> {
    try {
      // Extract product info from URL for AI research
      const productQuery = this.extractProductFromUrl(url);
      
      if (!productQuery) return null;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a product research expert. Provide accurate product information based on your knowledge.'
            },
            {
              role: 'user',
              content: `Research detailed information about: "${productQuery}". Provide specific technical specifications, features, brand information. Focus on factual information you are confident about.`
            }
          ],
          max_tokens: 600,
          temperature: 0.2,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiInfo = data.choices[0].message.content;
        
        return this.convertAIResponseToProductData(aiInfo, sourceName, productQuery, url);
      }
    } catch (error) {
      console.error('AI-based research error:', error);
    }
    
    return null;
  }

  private extractProductFromUrl(url: string): string | null {
    try {
      // Extract product information from search URLs
      const urlObj = new URL(url);
      
      // For Amazon URLs
      if (url.includes('amazon.com')) {
        const searchParams = urlObj.searchParams;
        const keywords = searchParams.get('k') || searchParams.get('field-keywords');
        if (keywords) return decodeURIComponent(keywords);
      }
      
      // For eBay URLs
      if (url.includes('ebay.com')) {
        const searchParams = urlObj.searchParams;
        const keywords = searchParams.get('_nkw');
        if (keywords) return decodeURIComponent(keywords);
      }
      
      // For Google Shopping URLs
      if (url.includes('google.com')) {
        const searchParams = urlObj.searchParams;
        const query = searchParams.get('q');
        if (query) return decodeURIComponent(query);
      }
      
      return null;
    } catch (error) {
      console.error('URL extraction error:', error);
      return null;
    }
  }

  private convertAIResponseToProductData(aiInfo: string, sourceName: string, productQuery: string, url: string): ProductSourceData {
    // Parse AI response to extract structured information
    const specifications: string[] = [];
    const features: string[] = [];
    
    // Extract specifications and features from AI response
    const lines = aiInfo.split('\n');
    lines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine.length > 10 && cleanLine.length < 200) {
        if (line.includes('spec') || line.includes('dimension') || line.includes('weight') || line.includes('material')) {
          specifications.push(cleanLine);
        } else if (line.includes('feature') || line.includes('capability') || line.includes('function')) {
          features.push(cleanLine);
        }
      }
    });
    
    // Extract brand if mentioned
    const brandMatch = aiInfo.match(/brand[:\s]+([a-zA-Z0-9\s]+)/i);
    const brand = brandMatch ? brandMatch[1].trim().split(' ')[0] : '';
    
    return {
      source: `${sourceName} (AI Research)`,
      url,
      title: productQuery,
      brand,
      specifications: specifications.slice(0, 5),
      features: features.slice(0, 5),
      images: [],
      structured_data: null,
      confidence: 0.6 // Lower confidence for AI-only research
    };
  }

  private parseAmazonProduct(html: string, url: string): ProductSourceData | null {
    try {
      // Extract structured data from Amazon product pages
      const structuredData = this.extractStructuredData(html);
      
      // Extract product title
      const titleMatch = html.match(/<span[^>]*id="productTitle"[^>]*>([^<]+)</i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      // Extract brand
      const brandMatch = html.match(/<tr[^>]*>\s*<td[^>]*>Brand[^<]*<\/td>\s*<td[^>]*>([^<]+)</i) ||
                        html.match(/<span[^>]*>Brand[^:]*:\s*([^<]+)</i);
      const brand = brandMatch ? brandMatch[1].trim() : '';
      
      // Extract specifications from feature bullets
      const specifications: string[] = [];
      const featureBullets = html.match(/<div[^>]*id="feature-bullets"[^>]*>(.*?)<\/div>/s);
      if (featureBullets) {
        const bullets = featureBullets[1].match(/<span[^>]*class="[^"]*feature[^"]*"[^>]*>([^<]+)</gi);
        if (bullets) {
          bullets.forEach(bullet => {
            const text = bullet.replace(/<[^>]*>/g, '').trim();
            if (text.length > 10 && text.length < 200) {
              specifications.push(text);
            }
          });
        }
      }
      
      // Extract images
      const images = this.extractProductImages(html, '');
      
      if (title) {
        return {
          source: 'Amazon',
          url,
          title,
          brand,
          specifications,
          features: specifications.slice(0, 5), // Use first 5 specs as features
          images,
          structured_data: structuredData,
          confidence: 0.9 // High confidence for Amazon data
        };
      }
    } catch (error) {
      console.error('Amazon parsing error:', error);
    }
    
    return null;
  }

  private parseEbayProduct(html: string, url: string): ProductSourceData | null {
    try {
      // Extract from eBay search results and product pages
      const structuredData = this.extractStructuredData(html);
      
      // Extract product title from search results or product page
      const titleMatch = html.match(/<h1[^>]*id="x-title-label-lbl"[^>]*>([^<]+)</i) ||
                        html.match(/<h3[^>]*class="[^"]*s-item__title[^"]*"[^>]*>([^<]+)</i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      // Extract specifications from item specifics
      const specifications: string[] = [];
      const itemSpecifics = html.match(/<div[^>]*class="[^"]*u-flL[^"]*"[^>]*>(.*?)<\/div>/gs);
      if (itemSpecifics) {
        itemSpecifics.forEach(specific => {
          const specMatch = specific.match(/<span[^>]*>([^<]+)</g);
          if (specMatch && specMatch.length >= 2) {
            const key = specMatch[0].replace(/<[^>]*>/g, '').trim();
            const value = specMatch[1].replace(/<[^>]*>/g, '').trim();
            if (key && value) {
              specifications.push(`${key}: ${value}`);
            }
          }
        });
      }
      
      // Extract images
      const images = this.extractProductImages(html, '');
      
      if (title) {
        return {
          source: 'eBay',
          url,
          title,
          specifications,
          features: specifications.slice(0, 5),
          images,
          structured_data: structuredData,
          confidence: 0.8 // Good confidence for eBay data
        };
      }
    } catch (error) {
      console.error('eBay parsing error:', error);
    }
    
    return null;
  }

  private parseGoogleShopping(html: string, url: string): ProductSourceData | null {
    try {
      // Extract from Google Shopping results
      const structuredData = this.extractStructuredData(html);
      
      // Extract product information from Google Shopping cards
      const specifications: string[] = [];
      const features: string[] = [];
      
      // Look for product cards and extract information
      const productCards = html.match(/<div[^>]*class="[^"]*sh-dlr__list-result[^"]*"[^>]*>(.*?)<\/div>/gs);
      if (productCards) {
        productCards.forEach(card => {
          const titleMatch = card.match(/<h3[^>]*>([^<]+)</i);
          const priceMatch = card.match(/\$([0-9,]+\.?[0-9]*)/);
          
          if (titleMatch) {
            features.push(`Product: ${titleMatch[1].trim()}`);
          }
        });
      }
      
      if (features.length > 0) {
        return {
          source: 'Google Shopping',
          url,
          title: features[0] || '',
          specifications,
          features,
          images: [],
          structured_data: structuredData,
          confidence: 0.7 // Moderate confidence for Google Shopping
        };
      }
    } catch (error) {
      console.error('Google Shopping parsing error:', error);
    }
    
    return null;
  }

  private extractStructuredData(html: string): any {
    try {
      // Extract JSON-LD structured data
      const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs);
      if (jsonLdMatches) {
        for (const match of jsonLdMatches) {
          const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
          try {
            const data = JSON.parse(jsonContent);
            if (data['@type'] === 'Product' || data.name || data.brand) {
              return data;
            }
          } catch (e) {
            continue;
          }
        }
      }
      
      // Extract microdata
      const microdataElements = html.match(/<[^>]*itemtype="[^"]*Product[^"]*"[^>]*>(.*?)<\/[^>]*>/gs);
      if (microdataElements) {
        const microdata: any = {};
        microdataElements.forEach(element => {
          const propMatch = element.match(/itemprop="([^"]*)"[^>]*>([^<]*)/g);
          if (propMatch) {
            propMatch.forEach(prop => {
              const [, key, value] = prop.match(/itemprop="([^"]*)"[^>]*>([^<]*)/) || [];
              if (key && value) {
                microdata[key] = value.trim();
              }
            });
          }
        });
        if (Object.keys(microdata).length > 0) {
          return microdata;
        }
      }
    } catch (error) {
      console.error('Structured data extraction error:', error);
    }
    
    return null;
  }

  private convertProductDataToSearchResults(productData: ProductSourceData[], query: string): string {
    let results = `Real product data found for "${query}":\n\n`;
    
    productData.forEach((product, index) => {
      results += `Source ${index + 1}: ${product.source}\n`;
      results += `Title: ${product.title}\n`;
      
      if (product.brand) {
        results += `Brand: ${product.brand}\n`;
      }
      
      
      if (product.specifications.length > 0) {
        results += `Specifications: ${product.specifications.slice(0, 3).join('; ')}\n`;
      }
      
      if (product.features.length > 0) {
        results += `Features: ${product.features.slice(0, 3).join('; ')}\n`;
      }
      
      results += `Confidence: ${product.confidence}\n\n`;
    });
    
    return results;
  }

  private async performBasicWebSearch(query: string): Promise<string> {
    // Enhanced fallback that tries to get real data
    try {
      if (!this.openAIApiKey) {
        return `Search results for "${query}": Accurate product information requires OpenAI API key configuration.`;
      }

      // Use AI to generate realistic product information based on the query
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a product research expert. Provide accurate, factual information about products based on your knowledge. Focus on real specifications, features, and details.'
            },
            {
              role: 'user',
              content: `Research and provide detailed, accurate information about: "${query}". Include real specifications, features, typical pricing, brand information, and what makes this product unique. Only provide factual information you are confident about.`
            }
          ],
          max_tokens: 800,
          temperature: 0.2,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return `AI Research Results for "${query}":\n${data.choices[0].message.content}`;
      }
    } catch (error) {
      console.error('Basic web search error:', error);
    }
    
    return `Limited search results for "${query}": Enhanced product research requires API configuration.`;
  }

  private async performWebScraping(query: string): Promise<string> {
    try {
      // Try different search approaches for better product information
      const searchUrls = [
        `https://www.google.com/search?q=${encodeURIComponent(query + ' specifications features')}`,
        `https://duckduckgo.com/?q=${encodeURIComponent(query + ' product details')}`,
        `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
        `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`
      ];
      
      // Try to get product information from multiple sources
      for (const url of searchUrls) {
        try {
          // Use a simple fetch with proper headers
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept-Encoding': 'gzip, deflate, br',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1'
            }
          });
          
          if (response.ok) {
            const html = await response.text();
            const extracted = this.extractProductInfo(html, query);
            if (extracted.info && extracted.info.length > 50) {
              // Store images for later use in color extraction
              if (extracted.images.length > 0) {
                this.productImages = extracted.images;
              }
              return extracted.info;
            }
          }
        } catch (fetchError) {
          console.log(`Failed to fetch ${url}:`, fetchError);
          continue;
        }
      }
      
      // If web scraping fails, use enhanced AI-based product analysis
      return await this.analyzeProductWithAI(query);
      
    } catch (error) {
      console.error('Web scraping error:', error);
      return await this.analyzeProductWithAI(query);
    }
  }

  private extractProductInfo(html: string, query: string): { info: string | null, images: string[] } {
    try {
      // Remove HTML tags and extract meaningful text
      const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Extract product images
      const images = this.extractProductImages(html, query);
      
      // Look for product-related keywords and information
      const productKeywords = query.split(' ').filter(word => word.length > 2);
      const relevantSections: string[] = [];
      
      // Look for specific product information patterns
      const productPatterns = [
        /specifications?[:\s]([^.]{20,200})/gi,
        /features?[:\s]([^.]{20,200})/gi,
        /dimensions?[:\s]([^.]{10,100})/gi,
        /weight[:\s]([^.]{5,50})/gi,
        /material[:\s]([^.]{5,100})/gi,
        /compatibility[:\s]([^.]{10,150})/gi,
        /model[:\s]([^.]{5,50})/gi,
        /brand[:\s]([^.]{5,50})/gi,
        /\$[\d,]+\.?\d*/g
      ];
      
      // Extract information using patterns
      for (const pattern of productPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          matches.forEach(match => {
            if (match.length > 10 && match.length < 200) {
              relevantSections.push(match.trim());
            }
          });
        }
      }
      
      // Also look for sentences containing product keywords
      const sentences = text.split(/[.!?]+/).slice(0, 150);
      
      for (const sentence of sentences) {
        const lowerSentence = sentence.toLowerCase();
        const matchCount = productKeywords.filter(keyword => 
          lowerSentence.includes(keyword.toLowerCase())
        ).length;
        
        // Look for sentences with product specifications
        const hasSpecTerms = /dimension|weight|material|compatibility|feature|specification|model|brand/.test(lowerSentence);
        
        if ((matchCount >= 2 || hasSpecTerms) && sentence.length > 25 && sentence.length < 250) {
          relevantSections.push(sentence.trim());
        }
      }
      
      const info = relevantSections.length > 0 ? 
        [...new Set(relevantSections)].slice(0, 8).join('. ') : null;
      
      return { info, images };
    } catch (error) {
      console.error('HTML parsing error:', error);
      return { info: null, images: [] };
    }
  }

  private extractProductImages(html: string, query: string): string[] {
    try {
      const images: string[] = [];
      const productKeywords = query.split(' ').filter(word => word.length > 2);
      
      // Extract img tags and their src attributes
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      let match;
      
      while ((match = imgRegex.exec(html)) !== null) {
        const imgSrc = match[1];
        const imgTag = match[0];
        
        // Check if image seems related to the product
        const lowerImgTag = imgTag.toLowerCase();
        const lowerImgSrc = imgSrc.toLowerCase();
        
        // Look for product-related keywords in image attributes
        const hasProductKeywords = productKeywords.some(keyword => 
          lowerImgTag.includes(keyword.toLowerCase()) || 
          lowerImgSrc.includes(keyword.toLowerCase())
        );
        
        // Check for common product image patterns
        const isProductImage = /product|item|main|hero|primary|detail|zoom|large/.test(lowerImgTag) ||
                              /product|item|main|hero|primary|detail|zoom|large/.test(lowerImgSrc);
        
        // Avoid common non-product images
        const isNotProductImage = /logo|icon|badge|star|arrow|button|social|footer|header|nav|menu|ad|banner/.test(lowerImgSrc);
        
        if ((hasProductKeywords || isProductImage) && !isNotProductImage) {
          // Make sure it's a full URL
          let fullUrl = imgSrc;
          if (imgSrc.startsWith('//')) {
            fullUrl = 'https:' + imgSrc;
          } else if (imgSrc.startsWith('/')) {
            // Need to construct full URL - this would require the base URL
            continue;
          }
          
          images.push(fullUrl);
        }
      }
      
      return images.slice(0, 3); // Return top 3 images
    } catch (error) {
      console.error('Image extraction error:', error);
      return [];
    }
  }

  private async analyzeProductWithAI(query: string): Promise<string> {
    if (!this.openAIApiKey) {
      return `Product analysis for "${query}": Advanced search requires OpenAI API key configuration.`;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a product research expert. Provide detailed, accurate information about products based on your knowledge.'
            },
            {
              role: 'user',
              content: `Provide detailed information about: "${query}". Include specifications, features, brand details, and what makes this product unique. Focus on factual information that would be useful for an eBay listing.`
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI product analysis error:', error);
      return `Product information for "${query}": Analysis requires API configuration.`;
    }
  }

  private async analyzeWithAI(prompt: string): Promise<string> {
    if (!this.openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a product research analyst. Extract and structure product information from web search results into JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI analysis error:', error);
      throw error;
    }
  }

  private parseResearchData(aiResponse: string): ProductResearchData {
    try {
      // Try to parse JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          specifications: parsed.specifications || [],
          features: parsed.features || [],
          marketKeywords: parsed.marketKeywords || [],
          productCategories: parsed.productCategories || [],
          brandInfo: parsed.brandInfo || '',
          productImages: this.productImages || [],
          brand: parsed.brand || '',
          model: parsed.model || '',
          sku: parsed.sku || '',
          confidence: parsed.confidence || 0.5,
          sources: parsed.sources || ['AI Analysis']
        };
      }
    } catch (error) {
      console.error('Failed to parse research data:', error);
    }
    
    // Fallback to default if parsing fails
    return this.getDefaultResearchData('');
  }

  private getDefaultResearchData(productTitle: string): ProductResearchData {
    return {
      specifications: ['Product research in progress - enhanced data requires API configuration'],
      features: ['Professional-grade quality', 'Reliable performance', 'Excellent value'],
      marketKeywords: ['quality', 'reliable', 'fast shipping', 'authentic'],
      productCategories: ['General Merchandise'],
      brandInfo: 'Brand information requires enhanced research configuration',
      productImages: this.productImages || [],
      brand: '',
      model: '',
      sku: '',
      confidence: 0.3,
      sources: ['Default Data']
    };
  }

  async generateColorPalette(productImages: string[], productTitle: string): Promise<ColorPalette> {
    try {
      // Ensure API key is initialized
      this.initializeApiKey();
      
      if (productImages.length > 0) {
        return await this.extractColorsFromImages(productImages);
      } else {
        return this.generatePaletteFromProductName(productTitle);
      }
    } catch (error) {
      console.error('Color palette generation error:', error);
      return this.getDefaultColorPalette();
    }
  }

  private async extractColorsFromImages(imageUrls: string[]): Promise<ColorPalette> {
    // Since we can't directly process images client-side without additional libraries,
    // we'll use AI to analyze the product and suggest colors
    if (!this.openAIApiKey) {
      return this.getDefaultColorPalette();
    }

    try {
      const prompt = `Based on these product image URLs: ${imageUrls.join(', ')}, suggest a professional color palette for an eBay listing.

Consider the likely product colors and create a harmonious palette with:
- Primary color (main product color)
- Secondary color (complementary)
- Accent color (for highlights)
- Background color (light, readable)
- Text color (high contrast)
- 3 light background variations

Return as JSON:
{
  "primaryColor": "#hex",
  "secondaryColor": "#hex", 
  "accentColor": "#hex",
  "backgroundColor": "#hex",
  "textColor": "#hex",
  "lightBackgrounds": ["#hex1", "#hex2", "#hex3"]
}

Ensure high contrast for readability and professional appearance.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a color design expert. Create professional, accessible color palettes for e-commerce listings.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        return this.parseColorPalette(aiResponse);
      }
    } catch (error) {
      console.error('AI color extraction error:', error);
    }

    return this.getDefaultColorPalette();
  }

  private generatePaletteFromProductName(productTitle: string): ColorPalette {
    const title = productTitle.toLowerCase();
    
    // Product-specific color associations
    if (title.includes('gold') || title.includes('golden')) {
      return {
        primaryColor: '#FFD700',
        secondaryColor: '#B8860B',
        accentColor: '#FFA500',
        backgroundColor: '#FFFEF7',
        textColor: '#2C1810',
        lightBackgrounds: ['#FFFEF7', '#FFF8DC', '#FFEFD5']
      };
    }
    
    if (title.includes('silver') || title.includes('chrome') || title.includes('steel')) {
      return {
        primaryColor: '#C0C0C0',
        secondaryColor: '#708090',
        accentColor: '#4682B4',
        backgroundColor: '#F8F8FF',
        textColor: '#2F4F4F',
        lightBackgrounds: ['#F8F8FF', '#F0F8FF', '#E6E6FA']
      };
    }
    
    if (title.includes('black') || title.includes('dark')) {
      return {
        primaryColor: '#2C2C2C',
        secondaryColor: '#696969',
        accentColor: '#4169E1',
        backgroundColor: '#FAFAFA',
        textColor: '#1C1C1C',
        lightBackgrounds: ['#FAFAFA', '#F5F5F5', '#E8E8E8']
      };
    }
    
    if (title.includes('red') || title.includes('crimson') || title.includes('ruby')) {
      return {
        primaryColor: '#DC143C',
        secondaryColor: '#B22222',
        accentColor: '#FF6347',
        backgroundColor: '#FFF5F5',
        textColor: '#8B0000',
        lightBackgrounds: ['#FFF5F5', '#FFE4E1', '#FFCCCB']
      };
    }
    
    if (title.includes('blue') || title.includes('navy') || title.includes('azure')) {
      return {
        primaryColor: '#1E90FF',
        secondaryColor: '#4682B4',
        accentColor: '#00BFFF',
        backgroundColor: '#F0F8FF',
        textColor: '#191970',
        lightBackgrounds: ['#F0F8FF', '#E6F2FF', '#DDEEFF']
      };
    }
    
    if (title.includes('green') || title.includes('emerald') || title.includes('forest')) {
      return {
        primaryColor: '#228B22',
        secondaryColor: '#32CD32',
        accentColor: '#00FF7F',
        backgroundColor: '#F0FFF0',
        textColor: '#006400',
        lightBackgrounds: ['#F0FFF0', '#E6FFE6', '#CCFFCC']
      };
    }
    
    if (title.includes('leather') || title.includes('brown') || title.includes('wood')) {
      return {
        primaryColor: '#8B4513',
        secondaryColor: '#A0522D',
        accentColor: '#D2691E',
        backgroundColor: '#FFF8DC',
        textColor: '#654321',
        lightBackgrounds: ['#FFF8DC', '#F5DEB3', '#DEB887']
      };
    }
    
    // Default professional palette
    return this.getDefaultColorPalette();
  }

  private parseColorPalette(aiResponse: string): ColorPalette {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          primaryColor: parsed.primaryColor || '#0066CC',
          secondaryColor: parsed.secondaryColor || '#4A90E2',
          accentColor: parsed.accentColor || '#7B68EE',
          backgroundColor: parsed.backgroundColor || '#FFFFFF',
          textColor: parsed.textColor || '#333333',
          lightBackgrounds: parsed.lightBackgrounds || ['#FFFFFF', '#F8F9FA', '#E9ECEF']
        };
      }
    } catch (error) {
      console.error('Failed to parse AI color palette:', error);
    }
    
    return this.getDefaultColorPalette();
  }

  private getDefaultColorPalette(): ColorPalette {
    return {
      primaryColor: '#0066CC',
      secondaryColor: '#4A90E2',
      accentColor: '#7B68EE',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      lightBackgrounds: ['#FFFFFF', '#F8F9FA', '#E9ECEF']
    };
  }
}

// Global AI service instance
export const aiService = new AIService();
export const productResearchService = ProductResearchService.getInstance();

// Auto-initialize OpenAI provider
const initializeServices = () => {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (apiKey) {
    const openAIProvider = new OpenAIProvider(apiKey);
    aiService.registerProvider('openai', openAIProvider);
    aiService.setDefaultProvider('openai');
  }
};

// Initialize services automatically
initializeServices(); 