import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { provider } = await req.json()

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
    }

    // Get user with all accounts
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if this is the account they're currently signed in with
    const accountToUnlink = user.accounts.find(acc => acc.provider === provider)
    
    if (!accountToUnlink) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Count remaining auth methods after unlinking
    const remainingAccounts = user.accounts.filter(acc => acc.provider !== provider)
    const hasPassword = !!user.password
    const totalRemainingMethods = remainingAccounts.length + (hasPassword ? 1 : 0)

    // Prevent unlinking the only authentication method
    if (totalRemainingMethods === 0) {
      return NextResponse.json(
        { error: 'Cannot unlink your only authentication method' },
        { status: 400 }
      )
    }

    // Remove the account
    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: provider
      }
    })

    // If they're unlinking their current session provider, invalidate all sessions
    const shouldInvalidateSession = totalRemainingMethods === 1 || 
      (remainingAccounts.length === 0 && hasPassword)

    if (shouldInvalidateSession) {
      // Delete all user sessions to force re-authentication
      await prisma.session.deleteMany({
        where: { userId: session.user.id }
      })

      return NextResponse.json({ 
        success: true, 
        forceSignOut: true,
        message: 'Account unlinked. Please sign in again with your remaining authentication method.'
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to unlink account:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
