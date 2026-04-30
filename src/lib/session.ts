import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function getUserIdFromSession(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return null
    }
    return (session.user as any).id || null
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export async function getSession() {
  try {
    return await getServerSession(authOptions)
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}
