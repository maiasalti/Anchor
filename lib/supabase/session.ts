import { cookies } from 'next/headers'

type SessionUser = {
  id: string
  email?: string
}

/**
 * Reads the user from the Supabase session cookie WITHOUT making any
 * network calls to Supabase. Zero auth API calls = zero rate limit risk.
 */
export async function getUserFromCookie(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const all = cookieStore.getAll()

  // Collect all chunks: sb-[ref]-auth-token, sb-[ref]-auth-token.0, etc.
  const chunks = all
    .filter((c) => c.name.match(/^sb-.+-auth-token(\.\d+)?$/))
    .sort((a, b) => a.name.localeCompare(b.name))

  if (chunks.length === 0) return null

  let raw = chunks.map((c) => c.value).join('')

  // The package may prefix base64url-encoded values with "base64-"
  if (raw.startsWith('base64-')) {
    const b64 = raw.slice('base64-'.length)
    raw = Buffer.from(b64, 'base64url').toString('utf-8')
  }

  try {
    const session = JSON.parse(raw)
    const accessToken: string | undefined = session?.access_token
    if (!accessToken) return null

    // Decode JWT payload — middle segment, no library needed
    const payloadB64 = accessToken.split('.')[1]
    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf-8')
    )

    if (!payload?.sub) return null

    // Don't reject on expiry — a stale token here still means the user is
    // logged in; Supabase will refresh it on the next actual API call.
    return {
      id: payload.sub as string,
      email: payload.email as string | undefined,
    }
  } catch {
    return null
  }
}
