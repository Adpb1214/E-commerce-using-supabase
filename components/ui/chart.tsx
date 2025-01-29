"use client"

import type { ComponentProps, ReactElement } from "react"
import {
  Line,
  LineChart as LineChartPrimitive,
  Pie,
  PieChart as PieChartPrimitive,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

type ChartConfig = {
  [key: string]: {
    theme?: {
      light?: string
      dark?: string
    }
    color?: string
  }
}

const THEMES = {
  light: "--light",
  dark: "--dark",
}

export function ChartContainer({
  children,
  className,
  ...props
}: ComponentProps<"div"> & { children: ReactElement }) {
  return (
    <div className={className} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

export function LineChart({
  data,
  id,
  config,
  ...props
}: ComponentProps<typeof LineChartPrimitive> & { id: string; config?: ChartConfig }) {
  return (
    <>
      <LineChartPrimitive data={data} {...props} data-chart={id}>
        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
        <Tooltip />
      </LineChartPrimitive>
      <ChartStyle id={id} config={config} />
    </>
  )
}

export function PieChart({
  data,
  id,
  config,
  ...props
}: ComponentProps<typeof PieChartPrimitive> & { id: string; config?: ChartConfig }) {
  return (
    <>
      <PieChartPrimitive {...props} data-chart={id}>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="hsl(var(--primary))" />
        <Tooltip />
      </PieChartPrimitive>
      <ChartStyle id={id} config={config} />
    </>
  )
}

const ChartStyle = ({ id, config }: { id: string; config?: ChartConfig }) => {
  const colorConfig = config ? Object.entries(config).filter(([, config]) => config.theme || config.color) : []

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .filter(Boolean)
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  )
}
