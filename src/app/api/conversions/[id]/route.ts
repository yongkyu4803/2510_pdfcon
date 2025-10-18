import { NextRequest, NextResponse } from 'next/server';
import { getConversion } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversion = await getConversion(id);

    if (!conversion) {
      return NextResponse.json({ error: '변환 작업을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(conversion);
  } catch (error) {
    console.error('Get conversion error:', error);
    return NextResponse.json({ error: '조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
