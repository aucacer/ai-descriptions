import { NextRequest, NextResponse } from 'next/server';
import { ProductResearchService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productTitle } = body;

    // Validate required fields
    if (!productTitle) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }

    // Get research service instance
    const researchService = ProductResearchService.getInstance();
    const researchData = await researchService.researchProduct(productTitle);

    return NextResponse.json(researchData);

  } catch (error) {
    console.error('Product research error:', error);
    return NextResponse.json({ 
      error: 'Failed to research product' 
    }, { status: 500 });
  }
}