"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { AlertCircle, Edit, PlusCircle, Trash } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const categories = [
  "Food & Dining",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Personal Care",
  "Education",
  "Travel",
  "Gifts & Donations",
  "Other",
]

interface Budget {
  id: number
  user_id: number
  username: string
  category: string
  limit: number
  spent: number
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [newBudget, setNewBudget] = useState({ category: "", limit: 0 })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const percentSpent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    setNewBudget({ category: budget.category, limit: budget.limit })
    setDialogOpen(true)
  }

  const handleSaveBudget = async () => {
    if (!editingBudget || newBudget.limit <= 0) return

    try {
      setBudgets(
        budgets.map(b =>
          b.id === editingBudget.id ? { ...b, limit: Number(newBudget.limit) } : b
        )
      )

      const res = await fetch(`http://localhost:8000/budget/edit/${editingBudget.id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: newBudget.limit }),
      })

      if (!res.ok) {
        console.log("Failed to update")
        return
      }

      const updated = await res.json()
      setBudgets(
        budgets.map(b => (b.id === updated.id ? updated : b))
      )
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Could not save budget")
    } finally {
      setDialogOpen(false)
      setEditingBudget(null)
      setNewBudget({ category: "", limit: 0 })
    }
  }

  useEffect(() => {
    async function fetchBudgets() {
      try {

        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`
          const parts = value.split(`; ${name}=`)
          if (parts.length === 2) return parts.pop()?.split(';').shift()
        }

        const csrfToken = getCookie("csrftoken")

        const response = await fetch("http://localhost:8000/budget/getAllBudget/", {
          method: "GET",
          credentials: "include",
          headers: {
            "X-CSRFToken": csrfToken || "", // Important!
          },
        })

        if (!response.ok) throw new Error("Failed to fetch budgets")

        const data = await response.json()
        setBudgets(Array.isArray(data) ? data : [])
      } catch (err: any) {
        setError(err.message || "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchBudgets()
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )

  return (
    <div className="flex flex-col p-4 md:p-6 gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage your Budgets</h1>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>{percentSpent}% of total budget spent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={percentSpent} />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Spent: ${totalSpent}</span>
              <span>Total Budget: ${totalBudget}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Spent ($)</TableHead>
                <TableHead>Limit ($)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell>{budget.category}</TableCell>
                  <TableCell>{budget.spent}</TableCell>
                  <TableCell>{budget.limit}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditBudget(budget)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
            <DialogDescription>Set your desired limit for this budget category</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newBudget.category} disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Budget Limit ($)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[newBudget.limit]}
                  min={0}
                  max={2000}
                  step={50}
                  onValueChange={(value) => setNewBudget({ ...newBudget, limit: value[0] })}
                />
                <Input
                  type="number"
                  className="w-24"
                  min={0}
                  value={newBudget.limit}
                  onChange={(e) => setNewBudget({ ...newBudget, limit: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveBudget}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}