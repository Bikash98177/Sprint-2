"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, PlusCircle, CalendarIcon, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { fetchUserIncome, Income } from "@/lib/get-income"
import { deleteIncome } from "@/lib/delete-income"
import { useRouter } from "next/navigation"

export default function IncomePage() {

  const router = useRouter();

  const [incomeData, setIncomeData] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSource, setSelectedSource] = useState("All Sources")
  const [sources, setSources] = useState<string[]>(["All Sources"])

  // Filter income entries based on search, source, and date
  const filteredIncome = incomeData.filter((income) => {
    const matchesSearch = income.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSource = selectedSource === "All Sources" || income.source === selectedSource
    const matchesDate = !date || format(income.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")

    return matchesSearch && matchesSource && matchesDate
  })

  const handleDelete = async ({ incomeId }: { incomeId: number }) => {
    const success = await deleteIncome({ incomeId })

    if (success) {
      setIncomeData(prev => prev.filter(income => income.id !== incomeId))
    }
  }


  useEffect(() => {
    const loadIncome = async () => {
      try {
        const data = await fetchUserIncome()
        setIncomeData(data)
        const uniqueSources = Array.from(new Set(data.map((income) => income.source)))
        setSources(["All Sources", ...uniqueSources])
      } catch (err) {
        console.error("Error fetching income:", err)
        setError("Could not load income data.")
      } finally {
        setLoading(false)
      }
    }

    loadIncome()
  }, [])

  return (
    <div className="flex flex-col p-4 md:p-6 gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Income</h1>
        <Link href="/dashboard/income/add">
          <Button className="gap-1">
            <PlusCircle className="h-4 w-4" /> Add Income
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search income..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem className="capitalize" key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[220px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
            {(date || selectedSource !== "All Sources" || searchTerm) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setDate(undefined)
                  setSelectedSource("All Sources")
                  setSearchTerm("")
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Income Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Income</CardTitle>
          <CardDescription>
            {filteredIncome.length} entries found • Total: $
            {filteredIncome.reduce((sum, income) => sum + income.amount, 0).toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncome.map((income) => (
                <TableRow className="cursor-pointer" key={income.id}>
                  <TableCell className="font-medium">{income.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{income.source}</Badge>
                  </TableCell>
                  <TableCell>{format(income.date, "MMM dd, yyyy")}</TableCell>
                  <TableCell className="text-right">${income.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/income/detail/${income.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/income/edit/${income.id}`}>
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete({ incomeId: income.id })}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredIncome.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No income entries found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
