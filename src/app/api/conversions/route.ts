import { NextResponse } from 'next/server';
import { getRecentConversions } from '@/lib/db';

export async function GET() {
  try {
    const conversions = await getRecentConversions(30);
    return NextResponse.json(conversions);
  } catch (error) {
    console.error('Get conversions error:', error);
    return NextResponse.json({ error: '조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
