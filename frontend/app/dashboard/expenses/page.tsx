"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, PlusCircle, CalendarIcon, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { fetchUserExpense } from "@/lib/get-expense";

interface Expense {
  id: number;
  name: string;
  amount: number;
  category: string;
  date: string; // date as string from backend
  notes: string;
  receipt_url: string | null;
}

const categories = [
  "All Categories",
  "Food & Dining",
  "Transportation",
  "Utilities",
  "Entertainment",
  "Housing",
  "Shopping",
  "Healthcare",
  "Other",
];

export default function ExpensesPage() {
  const [expensesData, setExpensesData] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await fetchUserExpense();
        setExpensesData(data);
      } catch (err) {
        setError("You have not logged any expenses yet.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const filteredExpenses = expensesData.filter((expense) => {
    const expenseDate = new Date(expense.date);

    const matchesSearch = expense.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" ||
      expense.category === selectedCategory;
    const matchesDate =
      !date || format(expenseDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");

    let matchesAdvancedFilters = true;
    if (advancedSearch) {
      if (amountMin && expense.amount < Number.parseFloat(amountMin))
        matchesAdvancedFilters = false;
      if (amountMax && expense.amount > Number.parseFloat(amountMax))
        matchesAdvancedFilters = false;
      if (dateRange.from && expenseDate < dateRange.from)
        matchesAdvancedFilters = false;
      if (dateRange.to && expenseDate > dateRange.to)
        matchesAdvancedFilters = false;
    }

    return (
      matchesSearch && matchesCategory && matchesDate && matchesAdvancedFilters
    );
  });

  return (
    <div className="flex flex-col p-4 md:p-6 gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Link href="/dashboard/expenses/add">
          <Button className="gap-1">
            <PlusCircle className="h-4 w-4" /> Add Expense
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search expenses..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-[220px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              className="ml-auto"
              onClick={() => setAdvancedSearch(!advancedSearch)}
            >
              {advancedSearch ? "Simple Search" : "Advanced Search"}
            </Button>
          </div>

          {advancedSearch && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount Range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={amountMin}
                    onChange={(e) => setAmountMin(e.target.value)}
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={amountMax}
                    onChange={(e) => setAmountMax(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from
                          ? format(dateRange.from, "PPP")
                          : "From date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) =>
                          setDateRange({ ...dateRange, from: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, "PPP") : "To date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) =>
                          setDateRange({ ...dateRange, to: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

          {(date ||
            selectedCategory !== "All Categories" ||
            searchTerm ||
            (advancedSearch &&
              (amountMin || amountMax || dateRange.from || dateRange.to))) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setDate(undefined);
                  setSelectedCategory("All Categories");
                  setSearchTerm("");
                  setAmountMin("");
                  setAmountMax("");
                  setDateRange({});
                }}
              >
                Clear all filters
              </Button>
            )}
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-muted-foreground">Loading expenses...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Expenses</CardTitle>
            <CardDescription>
              {filteredExpenses.length} expenses found • Total: $
              {filteredExpenses
                .reduce((sum, expense) => sum + expense.amount, 0)
                .toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {expense.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(expense.date, "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      ${expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {expense.receipt_url ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredExpenses.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No expenses found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
