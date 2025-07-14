"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { fetchUserIncome, Income } from "@/lib/get-income"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Expense, fetchUserExpense } from "@/lib/get-expense"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const { resolvedTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const { user, loading } = useAuth({ redirectIfUnauthenticated: true })
  const [incomeData, setIncomeData] = useState<Income[]>([])
  const [expenseData, setExpenseData] = useState<Expense[]>([])


  useEffect(() => {

    const loadIncome = async () => {
      const data = await fetchUserIncome()
      setIncomeData(data)
    }

    const loadExpense = async () => {
      const data = await fetchUserExpense()
      setExpenseData(data)
    }

    loadIncome()
    setIsMounted(true)
  }, [])

  const totalIncome = incomeData.reduce((acc, curr) => acc + curr.amount, 0)
  const totalExpense = expenseData.reduce((acc, curr) => acc + curr.amount, 0)

  if (!isMounted) return null


  return (
    <div className="flex flex-col p-4 md:p-6 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize">👋 {user?.username}, Welcome Back!</h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Link href="/dashboard/expenses/add">
              <Button size="sm" variant="link" className="gap-1">
                <PlusCircle className="h-4 w-4" /> Add Expense
              </Button>
            </Link>
            <Link href="/dashboard/income/add">
              <Button size="sm" variant="link" className="gap-1">
                <PlusCircle className="h-4 w-4" /> Add Income
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total Income" value={`$${totalIncome}`} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
        <SummaryCard title="Total Expenses" value={`$${totalExpense}`} icon={<CreditCard className="h-4 w-4 text-muted-foreground" />} />
        <SummaryCard title={totalIncome > totalExpense ? "Savings" : "Losses"} value={`$${totalIncome - totalExpense}`} icon={<ArrowUp className={cn("h-4 w-4 text-muted-foreground", totalIncome > totalExpense ? "text-green-500" : "text-red-500")} />} />
      </div>
    </div>
  )
}

// Extracted card component for reuse
function SummaryCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode; }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
