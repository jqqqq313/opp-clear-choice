import { Card, CardContent } from '@/components/ui/Card'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    label: string
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: React.ComponentType<{ className?: string }>
}

export function StatsCard({ title, value, change, icon: Icon }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {change && (
              <p className="text-xs text-gray-500 mt-1">
                <span
                  className={
                    change.type === 'increase'
                      ? 'text-green-600'
                      : change.type === 'decrease'
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }
                >
                  {change.type === 'increase' && '+'}
                  {change.value}%
                </span>{' '}
                {change.label}
              </p>
            )}
          </div>
          {Icon && (
            <div className="ml-4">
              <Icon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}