import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Deprecated endpoint',
      message: 'Use /api/generate-description instead. This endpoint has been removed.',
    },
    { status: 410 }
  );
}