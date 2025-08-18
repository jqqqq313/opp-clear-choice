import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import {
  UsersIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

async function getDashboardStats(userId: string) {
  // For now, we'll use mock data. In a real implementation, you'd query based on user's campaigns
  const totalVolunteers = await prisma.volunteer.count()
  const totalEvents = await prisma.event.count()
  const totalTasks = await prisma.task.count()
  const completedTasks = await prisma.task.count({
    where: { status: 'COMPLETED' }
  })

  // Mock recent activity
  const recentActivity = [
    {
      id: '1',
      type: 'volunteer_joined' as const,
      description: 'John Doe joined as a volunteer',
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: '2',
      type: 'event_created' as const,
      description: 'Town Hall Meeting scheduled for next week',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: '3',
      type: 'task_completed' as const,
      description: 'Phone banking task completed by Jane Smith',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    },
  ]

  return {
    totalVolunteers,
    activeVolunteers: Math.floor(totalVolunteers * 0.7), // Mock: 70% active
    totalEvents,
    upcomingEvents: Math.floor(totalEvents * 0.3), // Mock: 30% upcoming
    totalTasks,
    completedTasks,
    totalHours: 156, // Mock data
    recentActivity,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const stats = await getDashboardStats(session.user.id)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your campaign.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Volunteers"
            value={stats.totalVolunteers}
            change={{
              value: 12,
              label: 'from last month',
              type: 'increase'
            }}
            icon={UsersIcon}
          />
          <StatsCard
            title="Active Volunteers"
            value={stats.activeVolunteers}
            change={{
              value: 8,
              label: 'from last week',
              type: 'increase'
            }}
            icon={UsersIcon}
          />
          <StatsCard
            title="Upcoming Events"
            value={stats.upcomingEvents}
            change={{
              value: 2,
              label: 'from last month',
              type: 'increase'
            }}
            icon={CalendarIcon}
          />
          <StatsCard
            title="Completed Tasks"
            value={`${stats.completedTasks}/${stats.totalTasks}`}
            change={{
              value: Math.round((stats.completedTasks / stats.totalTasks) * 100),
              label: 'completion rate',
              type: 'neutral'
            }}
            icon={ClipboardDocumentListIcon}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentActivity activities={stats.recentActivity} />
          
          {/* Quick Actions */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/dashboard/volunteers/new"
                  className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <UsersIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-blue-900 font-medium">Add New Volunteer</span>
                  </div>
                </a>
                <a
                  href="/dashboard/events/new"
                  className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-green-900 font-medium">Create Event</span>
                  </div>
                </a>
                <a
                  href="/dashboard/tasks/new"
                  className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-purple-900 font-medium">Assign Task</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}