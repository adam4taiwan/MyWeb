// Redirect to the main ig-card route with date extracted from filename
// URL format: /api/ig-card/2026-04-03.png
// This allows Instagram to see a .png extension in the URL

import { NextRequest, NextResponse } from 'next/server'
import { GET as cardGET } from '../route'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  // Extract date from filename like "2026-04-03.png"
  const date = filename.replace(/\.png$/i, '')

  // Build a new request with the date param
  const url = new URL(req.url)
  url.pathname = '/api/ig-card'
  url.searchParams.set('date', date)

  const newReq = new NextRequest(url.toString(), {
    headers: req.headers,
    method: req.method,
  })

  return cardGET(newReq)
}
