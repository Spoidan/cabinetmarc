"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function ProgressBuckets({
  buckets,
}: {
  buckets: { label: string; count: number }[];
}) {
  const empty = buckets.every((b) => b.count === 0);
  if (empty) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Aucune donnée à afficher pour le moment.
      </p>
    );
  }
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <BarChart data={buckets} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
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
            formatter={(v) => [`${v}`, "Inscriptions"]}
          />
          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
