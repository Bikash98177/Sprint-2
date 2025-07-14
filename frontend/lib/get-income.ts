// lib/get-income.ts
export interface Income {
  id: number
  name: string
  amount: number
  source: string
  date: string // ISO format from backend
  notes: string
}

export async function fetchUserIncome(): Promise<Income[]> {
  const res = await fetch("http://localhost:8000/income/getUserIncomes/", {
    method: "GET",
    credentials: "include", // ⬅️ Required to include session cookie
  })

  if (!res.ok) {
    throw new Error("Failed to fetch income data")
  }

  return await res.json()
}