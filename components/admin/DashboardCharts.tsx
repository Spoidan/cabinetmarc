"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { formatDateFr } from "@/lib/format";

type Props = {
  series: { day: string; count: number }[];
  top: { name: string; count: number }[];
};

export function DashboardCharts({ series, top }: Props) {
  return (
    <>
      <article className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-4">Inscriptions (30 derniers jours)</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={series} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tickFormatter={(d) => formatDateFr(d, "d MMM")}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelFormatter={(d) => formatDateFr(d, "d MMMM")}
                formatter={(v) => [`${v}`, "Inscriptions"]}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-4">Cours les plus populaires</h2>
        <div className="h-64">
          {top.length === 0 ? (
            <p className="text-sm text-muted-foreground h-full flex items-center justify-center">
              Aucune donnée pour le moment.
            </p>
          ) : (
            <ResponsiveContainer>
              <BarChart data={top} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} layout="vertical">
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={140}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>
    </>
  );
}
