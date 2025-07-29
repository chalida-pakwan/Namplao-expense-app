'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function IncomeExpenseChart({
  labels,
  income,
  expense,
}: {
  labels: string[]
  income: number[]
  expense: number[]
}) {
  const data = {
    labels,
    datasets: [
      {
        label: 'รายรับ',
        data: income,
        backgroundColor: 'rgba(34,197,94,0.7)', // เขียว
      },
      {
        label: 'รายจ่าย',
        data: expense,
        backgroundColor: 'rgba(239,68,68,0.7)', // แดง
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'สรุปรายรับ-รายจ่ายรายเดือน',
      },
    },
  }

  return <Bar data={data} options={options} />
}
