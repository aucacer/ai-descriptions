import { NextRequest, NextResponse } from 'next/server';
import { ProductResearchService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productTitle, productImages } = body;

    // Validate required fields
    if (!productTitle) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }

    // Get research service instance
    const researchService = ProductResearchService.getInstance();
    const colorPalette = await researchService.generateColorPalette(
      productImages || [],
      productTitle
    );

    return NextResponse.json(colorPalette);

  } catch (error) {
    console.error('Color palette generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate color palette' 
    }, { status: 500 });
  }
}