import { NextRequest, NextResponse } from 'next/server';
import { generateEbayDescription, generateEbayDescriptionMeta } from '@/lib/ebay-assistant';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userText, productTitle, debug, includeFeatures, includeShipping, includeGuarantee, style, tone } = body || {};
    const searchParams = new URL(request.url).searchParams;
    const debugEnabled = debug === true || searchParams.get('debug') === '1';

    const input = (userText || productTitle || '').toString().trim();
    if (!input) {
      return NextResponse.json({ error: 'Provide `userText` or `productTitle`' }, { status: 400 });
    }

    const options = {
      includeFeatures,
      includeShipping,
      includeGuarantee,
      style,
      tone
    };

    if (debugEnabled) {
      const { text, meta } = await generateEbayDescriptionMeta(input, options);
      return NextResponse.json({
        description: text,
        provider: 'OpenAI Assistant',
        timestamp: new Date().toISOString(),
        meta,
      });
    } else {
      const description = await generateEbayDescription(input, options);
      return NextResponse.json({
        description,
        provider: 'OpenAI Assistant',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Description generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate description' 
    }, { status: 500 });
  }
}