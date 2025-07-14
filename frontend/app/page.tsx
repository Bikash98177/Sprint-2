import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, BarChart4, CreditCard, PieChart } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <main>
        <section className="w-full py-20 pt-40 flex items-center justify-center">
          <div className="container mx-auto h-max">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tighter sm:text-4xl md:text-5xl">
                  Track Your Expenses with Ease
                </h1>
                <p className="text-neutral-200">
                  Manage your finances, track expenses, and visualize your spending habits all in one place.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/auth/login">
                  <Button>
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* Features */}
        <section className="w-full pb-20">
          <div className="w-[90%] mx-auto">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <CreditCard className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-xl font-bold">Expense Management</h3>
                  <p className="text-muted-foreground">
                    Track expenses by categories, upload receipts, and view your spending patterns.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <PieChart className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-xl font-bold">Visualizations & Reports</h3>
                  <p className="text-muted-foreground">
                    Understand your finances with insightful charts and downloadable reports.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <BarChart4 className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-xl font-bold">Budgeting</h3>
                  <p className="text-muted-foreground">
                    Set monthly budgets and receive alerts when approaching your limits.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Expense Tracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
