export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-4 border-wine-200 border-t-wine-600 rounded-full animate-spin" />
      <p className="text-gray-500 text-sm font-medium">{message}</p>
    </div>
  )
}
