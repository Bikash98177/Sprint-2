// lib/get-income.ts
export interface Expense {
  id: number
  name: string
  amount: number
  category: string
  date: string
  notes: string
  receipt_url: string | null
  user_id: number
}


export async function fetchUserExpense(): Promise<Expense[]> {
  const res = await fetch("http://localhost:8000/expense/getUserExpenses/", {
    method: "GET",
    credentials: "include", // ⬅️ Required to include session cookie
  })

  if (!res.ok) {
    throw new Error("Failed to fetch income data")
  }

  return await res.json()
}