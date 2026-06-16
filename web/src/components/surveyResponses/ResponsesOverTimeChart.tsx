// region imports
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
// endregion

// region chart.js registration
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)
// endregion

// region types
export interface ChartDay {
  label: string
  count: number
  isToday?: boolean
}

interface ResponsesOverTimeChartProps {
  days: ChartDay[]
  title?: string
  subtitle?: string
  badge?: string
}
// endregion

// region component
export const ResponsesOverTimeChart = ({
  days,
  title = 'Responses over time',
  subtitle = 'Submission activity for the current week',
  badge,
}: ResponsesOverTimeChartProps) => {
  const data = {
    labels: days.map((d) => d.label),
    datasets: [
      {
        data: days.map((d) => d.count),
        backgroundColor: days.map((d) =>
          d.isToday ? '#6366f1' : '#c4b5fd',
        ),
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            ` ${ctx.parsed.y} response${ctx.parsed.y === 1 ? '' : 's'}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { size: 12 }, color: '#6b7280' },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: '#f3f4f6' },
        ticks: {
          stepSize: 1,
          font: { size: 12 },
          color: '#6b7280',
        },
      },
    },
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
        {badge && (
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-6 h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}
// endregion
