'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface AdvancedChartsProps {
  data: any[]
  type: 'line' | 'bar' | 'pie'
  title?: string
  xDataKey?: string
  yDataKey?: string
}

const COLORS = ['#FF8A5C', '#FFA726', '#66BB6A', '#42A5F5', '#AB47BC', '#EF5350']

export default function AdvancedCharts({ data, type, title, xDataKey = 'name', yDataKey = 'value' }: AdvancedChartsProps) {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xDataKey} />
              <YAxis />
              <Tooltip formatter={(value: any) => [`${value.toLocaleString()} บาท`, 'จำนวน']} />
              <Legend />
              <Line type="monotone" dataKey={yDataKey} stroke="#FF8A5C" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xDataKey} />
              <YAxis />
              <Tooltip formatter={(value: any) => [`${value.toLocaleString()} บาท`, 'จำนวน']} />
              <Legend />
              <Bar dataKey={yDataKey} fill="#FF8A5C" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={yDataKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [`${value.toLocaleString()} บาท`, 'จำนวน']} />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      )}
      {renderChart()}
    </div>
  )
}

// Specific chart components
export function ProfitAnalysisChart({ data }: { data: any[] }) {
  return (
    <AdvancedCharts
      data={data}
      type="line"
      title="📈 การวิเคราะห์กำไร"
      xDataKey="month"
      yDataKey="profit"
    />
  )
}

export function InvestmentDistributionChart({ data }: { data: any[] }) {
  return (
    <AdvancedCharts
      data={data}
      type="pie"
      title="📊 การกระจายการลงทุน"
      yDataKey="amount"
    />
  )
}

export function MonthlyRevenueChart({ data }: { data: any[] }) {
  return (
    <AdvancedCharts
      data={data}
      type="bar"
      title="💰 รายได้รายเดือน"
      xDataKey="month"
      yDataKey="revenue"
    />
  )
}
