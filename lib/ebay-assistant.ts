import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// Use gpt-4o-mini for optimal speed/quality balance
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Comprehensive style code database for popular sneakers
const STYLE_CODES: Record<string, string> = {
  // Air Jordan 1
  'jordan 1 chicago': '555088-101',
  'jordan 1 bred': '555088-010',
  'jordan 1 royal': '555088-007',
  'jordan 1 shadow': '555088-013',
  'jordan 1 bred toe': '555088-610',
  'jordan 1 shattered backboard': '555088-005',
  
  // Air Jordan 4
  'jordan 4 white cement': '840606-192',
  'jordan 4 bred': '308497-060',
  'jordan 4 black cat': '308497-002',
  'jordan 4 university blue': '308497-400',
  
  // Nike Dunk
  'dunk low panda': 'DD1391-100',
  'dunk low chicago': 'DD1503-101',
  
  // Adidas Yeezy
  'yeezy 350 v2 zebra': 'CP9654',
  'yeezy 350 v2 bred': 'CP9652',
  'yeezy 350 cream': 'CP9366',
  
  // New Balance
  'new balance 990v5 grey': 'M990GL5',
  '990v5 grey': 'M990GL5',
};

const SYSTEM_PROMPT = `You are an expert eBay listing creator who generates accurate, compelling product descriptions.

CRITICAL RULES:
1. Generate ONLY ONE product description for the EXACT product requested
2. NEVER generate multiple product descriptions
3. NEVER add unrelated products or examples
4. For Pokemon Elite Trainer Boxes: ALWAYS 9 booster packs (never 10)
5. For Sneakers: MUST include Style Code/SKU prominently
6. Be factually accurate with specifications
7. Create engaging, conversion-focused copy
8. End with contextual "Happy Shopping!" message specific to the product type

Pokemon ETB Standard Contents:
- 9 booster packs (NEVER 10)
- 65 card sleeves
- 45 Energy cards
- 1 player's guide
- 6 damage-counter dice
- 1 coin-flip die
- 2 condition markers
- 1 collector's box with dividers
- 1 code card for online play

Output Structure:
- Title (exact product name)
- Description (compelling overview)
- Style Code/SKU (for sneakers only - in dedicated section)
- Key Features (4-6 bullet points)
- Specifications (technical details, materials)
- What's Included (exact contents)
- Sizing (for sneakers only)
- Authentication Details (for sneakers only)
- Condition (New in original packaging)
- Shipping (fast, secure, 1-2 days)
- Authenticity Guarantee
- Happy Shopping (contextual message)

Do NOT include "Research Sources" or "Important Notes" sections.
IMPORTANT: Generate ONLY the listing for the requested product. Do not add any additional products or examples.`;

function findStyleCode(productName: string): string | null {
  const productLower = productName.toLowerCase();
  for (const [key, code] of Object.entries(STYLE_CODES)) {
    if (productLower.includes(key)) {
      return code;
    }
  }
  return null;
}

export async function generateEbayDescriptionMeta(
  userText: string,
  options?: {
    includeFeatures?: boolean;
    includeShipping?: boolean;
    includeGuarantee?: boolean;
    style?: string;
    tone?: string;
  }
): Promise<{
  text: string;
  meta: {
    model: string;
    generationTime: number;
    optimized: boolean;
  };
}> {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set');

  const startTime = Date.now();
  const productLower = userText.toLowerCase();
  
  // Detect product type
  const isSneaker = /sneakers?|shoes?|nike|adidas|jordan|new.*balance|converse|vans|air.*max|boost|chuck.*taylor/i.test(productLower);
  const isPokemon = /pokemon|pokémon|elite.*trainer.*box|etb/i.test(productLower);
  const isPresale = /presale/i.test(productLower);
  
  // Find style code if applicable
  const styleCode = isSneaker ? findStyleCode(userText) : null;

  // Extract options with defaults
  const {
    includeFeatures = true,
    includeShipping = true,
    includeGuarantee = true,
    style = 'professional',
    tone = 'friendly'
  } = options || {};

  try {
    const userPrompt = `Create ONE eBay listing for ONLY this product: "${userText}"

IMPORTANT: Generate ONLY ONE description for the exact product above. Do not generate multiple products or add examples.

Product Type: ${isSneaker ? 'SNEAKER' : isPokemon ? 'POKEMON TCG' : 'GENERAL'}
${isPresale ? 'This is a PRESALE item - include presale information.' : ''}
${styleCode ? `Known Style Code: ${styleCode}` : ''}

STYLE & TONE:
- Writing style: ${style}
- Writing tone: ${tone}

CONTENT OPTIONS:
${includeFeatures ? '- Include detailed features and benefits' : '- Skip features section'}
${includeShipping ? '- Include shipping and delivery information' : '- Skip shipping information'}
${includeGuarantee ? '- Include satisfaction guarantee' : '- Skip guarantee section'}

${isSneaker ? `SNEAKER REQUIREMENTS:
- Include Style Code/SKU in a dedicated prominent section
- Add comprehensive sizing information (US/UK/EU sizes, fit recommendations)
- Include authentication details (box labels, tags, unique features)
- Mention brand-specific technologies (Air Max, Boost, React, etc.)
- Include official colorway names
- Happy Shopping message should mention style, comfort, or the sneaker culture` : ''}

${isPokemon ? `POKEMON ETB REQUIREMENTS:
- MUST list 9 booster packs (not 10) - this is critical
- Include all standard ETB contents listed above
- Mention which Pokemon/set is featured
- Happy Shopping message should mention collecting, battles, or Pokemon journey` : ''}

Create a complete, professional eBay listing following the structure. The Happy Shopping message should be warm and specific to what buyers will enjoy about this ${isSneaker ? 'sneaker' : isPokemon ? 'Pokemon product' : 'product'}.

REMINDER: Generate ONLY the listing for "${userText}". Do not add any other products.

Format with proper Markdown:
- Use ** for bold headers
- Use bullet points for lists
- Keep formatting clean and professional`;

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1800,
    });

    let description = response.choices[0]?.message?.content || '';

    // Final validation for Pokemon ETBs
    if (isPokemon) {
      description = description.replace(/10 (booster pack|Pokémon TCG booster pack)/gi, '9 $1');
    }

    const generationTime = Date.now() - startTime;
    console.log(`Generation completed in ${generationTime}ms using ${MODEL}`);

    return {
      text: description,
      meta: {
        model: MODEL,
        generationTime,
        optimized: true
      }
    };

  } catch (error) {
    console.error('Generation error:', error);
    throw new Error('Failed to generate description: ' + error);
  }
}

export async function generateEbayDescription(
  userText: string,
  options?: {
    includeFeatures?: boolean;
    includeShipping?: boolean;
    includeGuarantee?: boolean;
    style?: string;
    tone?: string;
  }
): Promise<string> {
  const { text } = await generateEbayDescriptionMeta(userText, options);
  return text;
}