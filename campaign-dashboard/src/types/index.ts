import { 
  User, 
  Campaign, 
  Volunteer, 
  Event, 
  Task, 
  EventRSVP, 
  TaskCheckIn,
  UserRole,
  CampaignRole,
  RSVPStatus,
  Priority,
  TaskStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  NotificationType,
  NotificationStatus
} from '@prisma/client'

// Extended types with relations
export type UserWithCampaigns = User & {
  campaignMemberships: (CampaignMember & {
    campaign: Campaign
  })[]
}

export type CampaignMember = {
  id: string
  userId: string
  campaignId: string
  role: CampaignRole
  joinedAt: Date
  user: User
  campaign: Campaign
}

export type VolunteerWithTasks = Volunteer & {
  tasks: Task[]
  eventRSVPs: EventRSVP[]
  taskCheckIns: TaskCheckIn[]
}

export type EventWithRSVPs = Event & {
  rsvps: (EventRSVP & {
    volunteer?: Volunteer
    user?: User
  })[]
  eventType?: {
    id: string
    name: string
    color: string
  }
}

export type TaskWithDetails = Task & {
  category?: {
    id: string
    name: string
    color: string
  }
  assignedTo?: User
  volunteer?: Volunteer
  checkIns: (TaskCheckIn & {
    volunteer?: Volunteer
    user?: User
  })[]
}

export type DashboardStats = {
  totalVolunteers: number
  activeVolunteers: number
  totalEvents: number
  upcomingEvents: number
  totalTasks: number
  completedTasks: number
  totalHours: number
  recentActivity: {
    id: string
    type: 'volunteer_joined' | 'event_created' | 'task_completed' | 'rsvp_confirmed'
    description: string
    createdAt: Date
  }[]
}

export type NotificationSettings = {
  emailEnabled: boolean
  smsEnabled: boolean
  eventReminders: boolean
  taskReminders: boolean
  digestEmails: boolean
  reminderTiming: {
    eventReminder24h: boolean
    eventReminder1h: boolean
    taskDueReminder: boolean
  }
}

// Form types
export type CreateVolunteerForm = {
  name: string
  email: string
  phone?: string
  address?: string
  skills: string[]
  availability: string[]
  notes?: string
}

export type CreateEventForm = {
  title: string
  description?: string
  location?: string
  startDate: Date
  endDate?: Date
  eventTypeId?: string
  maxAttendees?: number
}

export type CreateTaskForm = {
  title: string
  description?: string
  categoryId?: string
  assignedToId?: string
  volunteerId?: string
  priority: Priority
  dueDate?: Date
  estimatedHours?: number
  location?: string
}

export type CampaignSettings = {
  name: string
  description?: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  notificationSettings: NotificationSettings
}

// Re-export Prisma enums
export {
  UserRole,
  CampaignRole,
  RSVPStatus,
  Priority,
  TaskStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  NotificationType,
  NotificationStatus
}