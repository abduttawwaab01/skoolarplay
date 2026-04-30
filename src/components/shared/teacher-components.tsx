import { Star } from 'lucide-react'

export const subjectColors: Record<string, string> = {
  Mathematics: 'bg-blue-500/10 text-blue-600',
  English: 'bg-green-500/10 text-green-600',
  Science: 'bg-purple-500/10 text-purple-600',
  'Nigerian Languages': 'bg-amber-500/10 text-amber-600',
  History: 'bg-red-500/10 text-red-600',
  Technology: 'bg-cyan-500/10 text-cyan-600',
  'Business Studies': 'bg-orange-500/10 text-orange-600',
  Arts: 'bg-pink-500/10 text-pink-600',
}

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-xs font-medium text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  )
}
