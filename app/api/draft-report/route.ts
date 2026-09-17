import { NextResponse } from 'next/server';
import { draftReport } from '@/lib/claude';
import type { Category } from '@/lib/types';

export async function POST(request: Request) {
  const body = await request.json();
  const categories: Category[] = Array.isArray(body.categories) ? body.categories : [];
  const freeText = typeof body.freeText === 'string' ? body.freeText : '';
  const evidenceNotes = typeof body.evidenceNotes === 'string' ? body.evidenceNotes : '';
  const draft = await draftReport({ categories, freeText, evidenceNotes });
  return NextResponse.json({ draft });
}
