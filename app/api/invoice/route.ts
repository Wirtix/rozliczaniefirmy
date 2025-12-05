import { NextRequest, NextResponse } from 'next/server';
import { buildInvoice } from '../../lib/invoice';

export async function POST(req: NextRequest) {
  const data = await req.json();
  try {
    const pdf = await buildInvoice(data);
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rachunek_${(data.number || '1').replace(/\//g, '_')}.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Nie udało się wygenerować PDF' }, { status: 400 });
  }
}
