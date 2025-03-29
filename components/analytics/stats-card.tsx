import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatIndianCurrency } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string
  description?: string
  icon?: React.ReactNode
  className?: string
  isCurrency?: boolean
}

export function StatsCard({ title, value, description, icon, className, isCurrency = false }: StatsCardProps) {
  // Format the value if it's a currency
  const displayValue = isCurrency ? formatIndianCurrency(Number.parseInt(value.replace(/[^0-9]/g, ""))) : value

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-5 w-5 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}

