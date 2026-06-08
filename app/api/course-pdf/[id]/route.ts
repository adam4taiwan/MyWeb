import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lessonId = parseInt(id);
  if (isNaN(lessonId) || lessonId < 1 || lessonId > 6) {
    return new NextResponse('Not found', { status: 404 });
  }

  const isFree = lessonId === 1;
  const authHeader = request.headers.get('Authorization');

  if (!isFree) {
    if (!authHeader) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify token and subscription via Ecanapi
    const [profileRes, subRes] = await Promise.all([
      fetch(`${API_BASE}/Auth/profile`, { headers: { Authorization: authHeader } }),
      fetch(`${API_BASE}/Subscription/status`, { headers: { Authorization: authHeader } }),
    ]);

    if (!profileRes.ok) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const profile = await profileRes.json();
    const isAdmin = profile?.isAdmin === true;

    if (!isAdmin) {
      const sub = subRes.ok ? await subRes.json() : null;
      if (!sub?.isSubscribed) {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }
  }

  const pdfPath = path.join(process.cwd(), 'private-pdfs', `lesson-${lessonId}.pdf`);
  if (!fs.existsSync(pdfPath)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="lesson.pdf"',
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
