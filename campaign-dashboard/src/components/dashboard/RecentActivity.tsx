import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatRelativeTime } from '@/utils/date'

interface ActivityItem {
  id: string
  type: 'volunteer_joined' | 'event_created' | 'task_completed' | 'rsvp_confirmed'
  description: string
  createdAt: Date
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

const activityIcons = {
  volunteer_joined: '👥',
  event_created: '📅',
  task_completed: '✅',
  rsvp_confirmed: '🎯',
}

const activityColors = {
  volunteer_joined: 'bg-green-100 text-green-800',
  event_created: 'bg-blue-100 text-blue-800',
  task_completed: 'bg-purple-100 text-purple-800',
  rsvp_confirmed: 'bg-orange-100 text-orange-800',
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${activityColors[activity.type]}`}>
                {activityIcons[activity.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">{formatRelativeTime(activity.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}