// hooks/use-auth.ts
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchUser, User } from "@/lib/get-current-user"

interface UseAuthOptions {
  redirectTo?: string
  redirectIfUnauthenticated?: boolean
}

export function useAuth(options?: UseAuthOptions) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      const userData = await fetchUser()
      if (!userData && options?.redirectIfUnauthenticated) {
        router.push(options.redirectTo || "/")
      } else {
        setUser(userData)
      }
      setLoading(false)
    }
    check()
  }, [])

  return { user, loading }
}
