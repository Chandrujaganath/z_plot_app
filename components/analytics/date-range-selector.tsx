"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { subDays, subMonths, subYears } from "date-fns"

interface DateRangeOption {
  label: string
  value: string
  getRange: () => { start: Date; end: Date }
}

interface DateRangeSelectorProps {
  onRangeChange: (range: { start: Date; end: Date }) => void
  className?: string
}

export function DateRangeSelector({ onRangeChange, className }: DateRangeSelectorProps) {
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const dateRangeOptions: DateRangeOption[] = [
    {
      label: "Last 7 days",
      value: "7days",
      getRange: () => ({
        start: subDays(today, 6),
        end: today,
      }),
    },
    {
      label: "Last 30 days",
      value: "30days",
      getRange: () => ({
        start: subDays(today, 29),
        end: today,
      }),
    },
    {
      label: "Last 3 months",
      value: "3months",
      getRange: () => ({
        start: subMonths(today, 3),
        end: today,
      }),
    },
    {
      label: "Last 6 months",
      value: "6months",
      getRange: () => ({
        start: subMonths(today, 6),
        end: today,
      }),
    },
    {
      label: "Last year",
      value: "1year",
      getRange: () => ({
        start: subYears(today, 1),
        end: today,
      }),
    },
    {
      label: "All time",
      value: "all",
      getRange: () => ({
        start: subYears(today, 10), // Assuming the app is less than 10 years old
        end: today,
      }),
    },
  ]

  const [selectedRange, setSelectedRange] = useState<string>(dateRangeOptions[1].value) // Default to 30 days

  const handleRangeChange = (option: DateRangeOption) => {
    setSelectedRange(option.value)
    const range = option.getRange()
    onRangeChange(range)
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          {dateRangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedRange === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleRangeChange(option)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

