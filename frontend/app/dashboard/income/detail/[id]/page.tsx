"use client"

import React, { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface Income {
  id: number
  name: string
  amount: number
  source: string
  date: string
  notes?: string
}

interface DetailPageProps {
  params: { id: string }
}

export default function IncomeDetailPage({ params }: { params: Promise<{ id: string }> }) {

  const resolvedParams = use(params);
  const id = resolvedParams.id; const router = useRouter()
  const [income, setIncome] = useState<Income | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchIncome() {
      try {
        const response = await fetch(`http://localhost:8000/income/getIncomeById/?id=${id}`, {
          credentials: "include",
        })
        if (!response.ok) {
          throw new Error(`Failed to fetch income with id ${id}`)
        }
        const data = await response.json()
        setIncome(data)
      } catch (err: any) {
        setError(err.message || "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchIncome()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    )
  }

  if (error || !income) {
    return (
      <div className="p-4 text-center text-destructive">
        <p>{error || "Income not found"}</p>
        <Button className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="w-[80%] h-screen flex items-center justify-center mx-auto p-4 md:p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Income Details</CardTitle>
          <CardDescription>Details for income ID: {income.id}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-5 gap-y-5">
          <div className="col-span-2">
            <Label>Name</Label>
            <p className="border-b py-2.5">{income.name}</p>
          </div>
          <div className="col-span-1">
            <Label>Amount</Label>
            <p className="border-b py-2.5">${income.amount.toFixed(2)}</p>
          </div>
          <div className="col-span-1">
            <Label>Source</Label>
            <p className="border-b py-2.5">{income.source}</p>
          </div>
          <div className="col-span-2">
            <Label>Date</Label>
            <p className="border-b py-2.5">{format(new Date(income.date), "PPP")}</p>
          </div>
          {income.notes && (
            <div className="col-span-2">
              <Label>Notes</Label>
              <p className="whitespace-pre-wrap">{income.notes}</p>
            </div>
          )}
        </CardContent>
        <div className="p-4 flex justify-end">
          <Button asChild variant="outline">
            <Link href="/dashboard/income">
              Back
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
