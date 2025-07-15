import { NextRequest, NextResponse } from 'next/server';
import { OpenAIProvider, DescriptionRequest } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productTitle, style, tone, includeFeatures, includeShipping, includeGuarantee, researchData } = body;

    // Validate required fields
    if (!productTitle) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }

    // Create description request
    const descriptionRequest: DescriptionRequest = {
      productTitle,
      style: style || 'professional',
      tone: tone || 'friendly',
      includeFeatures: includeFeatures !== false,
      includeShipping: includeShipping !== false,
      includeGuarantee: includeGuarantee !== false,
      researchData
    };

    // Initialize OpenAI provider with server-side API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const openAIProvider = new OpenAIProvider(apiKey);
    const description = await openAIProvider.generateDescription(descriptionRequest);

    return NextResponse.json({ 
      description,
      provider: 'OpenAI',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Description generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate description' 
    }, { status: 500 });
  }
}