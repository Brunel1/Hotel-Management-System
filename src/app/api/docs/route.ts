import { NextResponse } from 'next/server'
import { getOpenAPISpec } from '@/lib/swagger'

/**
 * Route API pour servir la documentation OpenAPI/Swagger
 * GET /api/docs
 */
export async function GET() {
  const spec = getOpenAPISpec()

  return NextResponse.json(spec, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
