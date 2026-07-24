export default function StatsCard({ icon: Icon, label, value, subValue, color = 'wine' }) {
  const colorMap = {
    wine: 'bg-wine-50 text-wine-600 border-wine-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-soft p-5 flex items-start gap-4">
      <div className={`p-3 rounded-lg border ${colorMap[color] || colorMap.wine}`}>
        <Icon size={24} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-ink mt-0.5">{value}</p>
        {subValue && (
          <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>
        )}
      </div>
    </div>
  )
}
