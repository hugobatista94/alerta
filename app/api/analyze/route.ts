import { NextResponse } from 'next/server';
import { analyzeReport } from '@/lib/claude';

export async function POST(request: Request) {
  const body = await request.json();
  const freeText = typeof body.freeText === 'string' ? body.freeText : '';
  const result = await analyzeReport(freeText);
  return NextResponse.json(result);
}
