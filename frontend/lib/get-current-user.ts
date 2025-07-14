export interface User {
  username: string
}

export const fetchUser = async (): Promise<User | null> => {
  try {
    const res = await fetch("http://localhost:8000/user/me/", {
      method: "GET",
      credentials: "include",
    })

    if (!res.ok) return null

    const data = await res.json()
    return { username: data.username }
  } catch (err) {
    console.error("Error fetching user:", err)
    return null
  }
}
