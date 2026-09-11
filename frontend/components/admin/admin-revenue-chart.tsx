"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"
import { TrendingUp, Sparkles, Calendar, Layers, BarChart3, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { CategoryRevenueSummary, DailyRevenuePoint } from "@/lib/types"

/** Kept as exported aliases so existing imports keep compiling. */
export type DailyPoint = DailyRevenuePoint
export type CategorySummary = CategoryRevenueSummary

/** Money values arrive as numbers from /admin/stats; formatted strings are also accepted. */
type Money = number | string

const formatMoney = (v: Money): string =>
  typeof v === "number" ? `€${v.toLocaleString("en-IE", { minimumFractionDigits: 2 })}` : v

interface AdminRevenueChartProps {
  dailyData?: DailyPoint[]
  categoryData?: CategorySummary[]
  past30DaysRevenue?: Money
  avgDailyRevenue?: Money
  peakDay?: DailyPoint | null
  isLoading?: boolean
}

export function AdminRevenueChart({
  dailyData = [],
  categoryData = [],
  past30DaysRevenue = 0,
  avgDailyRevenue = 0,
  peakDay,
  isLoading = false,
}: AdminRevenueChartProps) {
  const [chartType, setChartType] = React.useState<"trend" | "breakdown">("trend")

  // Fallback if data is empty during initial load
  const formattedData = React.useMemo(() => {
    if (dailyData && dailyData.length > 0) {
      return dailyData
    }
    // Generate empty 30-day timeline
    const fallback: DailyPoint[] = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      fallback.push({
        date: d.toISOString().split("T")[0],
        short_date: d.toLocaleDateString("en-IE", { day: "2-digit", month: "short" }),
        day_name: d.toLocaleDateString("en-IE", { weekday: "short" }),
        revenue: 0,
        bookings_count: 0,
        manicure_revenue: 0,
        pedicure_revenue: 0,
        treatment_revenue: 0,
        top_service: "None",
      })
    }
    return fallback
  }, [dailyData])

  // Custom luxury tooltip
  interface RevenueTooltipProps {
    active?: boolean
    label?: string | number
    payload?: Array<{ payload: DailyPoint }>
  }
  const CustomTooltip = ({ active, payload, label }: RevenueTooltipProps) => {
    if (active && payload && payload.length) {
      const item: DailyPoint = payload[0].payload
      return (
        <div className="rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-md p-4 shadow-xl text-xs space-y-2.5 min-w-[220px]">
          <div className="border-b border-border/50 pb-2">
            <div className="font-semibold text-foreground text-sm flex items-center justify-between">
              <span>{item.short_date} ({item.day_name})</span>
              <Badge variant="gold" className="text-[10px] px-1.5 py-0">
                {item.bookings_count} {item.bookings_count === 1 ? "booking" : "bookings"}
              </Badge>
            </div>
            <p className="text-lg font-serif font-bold text-primary mt-1">
              €{item.revenue.toFixed(2)}
            </p>
          </div>

          <div className="space-y-1.5 pt-1 text-[11px]">
            <p className="text-muted-foreground font-medium uppercase tracking-wider text-[9px]">
              Revenue by Treatment:
            </p>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-[#c9a37e]" />
                Manicures:
              </span>
              <span className="font-semibold text-foreground">€{item.manicure_revenue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-[#9e7552]" />
                Pedicures:
              </span>
              <span className="font-semibold text-foreground">€{item.pedicure_revenue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-[#8c6239]" />
                Spa & Treatments:
              </span>
              <span className="font-semibold text-foreground">€{item.treatment_revenue.toFixed(2)}</span>
            </div>
          </div>

          {item.top_service && item.top_service !== "None" && (
            <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
              <span className="font-medium text-foreground">Top Treatment:</span> {item.top_service}
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="rounded-3xl border-border/70 bg-card shadow-sm overflow-hidden">
      <CardHeader className="p-6 pb-4 border-b border-border/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <CardTitle className="text-lg font-serif font-bold text-foreground">
                Monthly Daily Revenue Analytics
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Daily salon intake breakdown across the past 30 days from PostgreSQL database
            </CardDescription>
          </div>

          {/* Quick Stats & View Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60 text-xs">
              <Button
                variant={chartType === "trend" ? "luxury" : "ghost"}
                size="sm"
                onClick={() => setChartType("trend")}
                className="h-7 text-xs rounded-lg px-2.5 gap-1"
              >
                <TrendingUp className="w-3 h-3" />
                <span>Total Trend</span>
              </Button>
              <Button
                variant={chartType === "breakdown" ? "luxury" : "ghost"}
                size="sm"
                onClick={() => setChartType("breakdown")}
                className="h-7 text-xs rounded-lg px-2.5 gap-1"
              >
                <Layers className="w-3 h-3" />
                <span>Categories</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 30-Day Executive Highlight Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
              30-Day Total Revenue
            </span>
            <span className="text-lg font-serif font-bold text-primary">
              {formatMoney(past30DaysRevenue)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
              Daily Average
            </span>
            <span className="text-lg font-serif font-bold text-foreground">
              {formatMoney(avgDailyRevenue)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
              Peak Day
            </span>
            <span className="text-sm font-semibold text-foreground flex items-center gap-1 mt-0.5">
              {peakDay ? (
                <>
                  <span className="text-primary font-bold">€{peakDay.revenue.toFixed(0)}</span>
                  <span className="text-muted-foreground text-xs">({peakDay.short_date})</span>
                </>
              ) : (
                "N/A"
              )}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
              Data Source
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live PostgreSQL
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-4">
        {/* Chart View */}
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "trend" ? (
              <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a37e" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#c9a37e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="short_date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  interval={3}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(val) => `€${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#c9a37e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            ) : (
              <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="short_date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  interval={3}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(val) => `€${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
                />
                <Bar dataKey="manicure_revenue" name="Manicure" stackId="a" fill="#c9a37e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pedicure_revenue" name="Pedicure" stackId="a" fill="#9e7552" radius={[0, 0, 0, 0]} />
                <Bar dataKey="treatment_revenue" name="Spa & Treatments" stackId="a" fill="#8c6239" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Category Contribution Share Pills */}
        {categoryData && categoryData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {categoryData.map((cat) => (
              <div
                key={cat.category}
                className="p-3 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color || "#c9a37e" }}
                  />
                  <div>
                    <p className="font-semibold text-xs text-foreground">{cat.category}</p>
                    <p className="text-[10px] text-muted-foreground">{cat.bookings} reservations</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-serif font-bold text-xs text-primary">€{cat.revenue.toFixed(2)}</p>
                  <p className="text-[10px] font-medium text-muted-foreground">{cat.percentage.toFixed(1)}% share</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
