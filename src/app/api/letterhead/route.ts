import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { LetterheadPDF } from '@/components/shared/letterhead-pdf'

export async function GET() {
  try {
    console.log('Starting PDF generation...')
    
    const pdfBuffer = await renderToBuffer(LetterheadPDF({}))
    
    console.log('PDF generated successfully, size:', pdfBuffer.length)
    
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Skoolar-Letterhead.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
