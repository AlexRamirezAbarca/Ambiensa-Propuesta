import { NextRequest, NextResponse } from 'next/server'

const API_BASE = 'http://127.0.0.1:3001'

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/users`, { cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ success: true, data: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const res = await fetch(`${API_BASE}/users/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ success: false, message: 'El servidor backend no está disponible.' }, { status: 503 })
  }
}
