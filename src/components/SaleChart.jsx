import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

export default function SaleChart({ data, labels, title = 'Sales Trend' }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Sales',
        data,
        fill: true,
        borderColor: '#c82a3e',
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300)
          g.addColorStop(0, 'rgba(200, 42, 62, 0.25)')
          g.addColorStop(1, 'rgba(200, 42, 62, 0)')
          return g
        },
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#c82a3e',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderWidth: 2
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: title,
        align: 'start',
        font: { size: 14, weight: '600', family: 'Inter' },
        color: '#1a1417',
        padding: { bottom: 16 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 11 } }
      },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          callback: (v) => `$${v}`
        }
      }
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-soft p-5">
      <div style={{ height: 280 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}

export function chartEmptyData(title) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-soft p-5">
      <h3 className="text-sm font-semibold text-ink mb-1">{title}</h3>
      <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
        No sales data yet
      </div>
    </div>
  )
}
