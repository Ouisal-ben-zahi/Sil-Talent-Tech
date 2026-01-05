import { NextResponse } from 'next/server'
import staticContent from '@/data/static-content.json'

export async function GET() {
  try {
    return NextResponse.json(staticContent)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du contenu statique' },
      { status: 500 }
    )
  }
}









