import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a default campaign
  let campaign = await prisma.campaign.findFirst({
    where: { name: 'Demo Campaign 2024' }
  })
  
  if (!campaign) {
    campaign = await prisma.campaign.create({
      data: {
        name: 'Demo Campaign 2024',
        description: 'A demo campaign to showcase the dashboard features',
        primaryColor: '#3B82F6',
        secondaryColor: '#1F2937',
      },
    })
  }

  console.log('✅ Created campaign:', campaign.name)

  // Create an admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@campaign.com' },
    update: {},
    create: {
      email: 'admin@campaign.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Create campaign membership for admin
  await prisma.campaignMember.upsert({
    where: {
      userId_campaignId: {
        userId: adminUser.id,
        campaignId: campaign.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      campaignId: campaign.id,
      role: 'ADMIN',
    },
  })

  // Create some sample volunteers
  const sampleVolunteers = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, Anytown, ST 12345',
      skills: JSON.stringify(['Phone Banking', 'Canvassing', 'Data Entry']),
      availability: JSON.stringify(['Weekends', 'Evenings']),
      campaignId: campaign.id,
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1 (555) 987-6543',
      address: '456 Oak Ave, Somewhere, ST 67890',
      skills: JSON.stringify(['Event Planning', 'Social Media', 'Fundraising']),
      availability: JSON.stringify(['Weekdays', 'Mornings']),
      campaignId: campaign.id,
    },
    {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+1 (555) 456-7890',
      skills: JSON.stringify(['Graphic Design', 'Photography', 'Writing']),
      availability: JSON.stringify(['Flexible', 'Weekend Afternoons']),
      campaignId: campaign.id,
    },
    {
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '+1 (555) 321-0987',
      skills: JSON.stringify(['Translation', 'Community Outreach', 'Phone Banking']),
      availability: JSON.stringify(['Weekday Evenings', 'Weekends']),
      campaignId: campaign.id,
    },
  ]

  for (const volunteer of sampleVolunteers) {
    const existing = await prisma.volunteer.findFirst({
      where: { email: volunteer.email }
    })
    
    if (!existing) {
      await prisma.volunteer.create({
        data: volunteer,
      })
    }
  }

  console.log('✅ Created', sampleVolunteers.length, 'sample volunteers')

  // Create event types
  const eventTypes = [
    { name: 'Town Hall', color: '#3B82F6', campaignId: campaign.id },
    { name: 'Fundraiser', color: '#10B981', campaignId: campaign.id },
    { name: 'Phone Bank', color: '#F59E0B', campaignId: campaign.id },
    { name: 'Canvass', color: '#EF4444', campaignId: campaign.id },
  ]

  for (const eventType of eventTypes) {
    const existing = await prisma.eventType.findFirst({
      where: {
        campaignId: eventType.campaignId,
        name: eventType.name,
      },
    })
    
    if (!existing) {
      await prisma.eventType.create({
        data: eventType,
      })
    }
  }

  console.log('✅ Created event types')

  // Create task categories
  const taskCategories = [
    { name: 'Outreach', color: '#3B82F6', campaignId: campaign.id },
    { name: 'Admin', color: '#6B7280', campaignId: campaign.id },
    { name: 'Events', color: '#10B981', campaignId: campaign.id },
    { name: 'Media', color: '#F59E0B', campaignId: campaign.id },
  ]

  for (const category of taskCategories) {
    const existing = await prisma.taskCategory.findFirst({
      where: {
        campaignId: category.campaignId,
        name: category.name,
      },
    })
    
    if (!existing) {
      await prisma.taskCategory.create({
        data: category,
      })
    }
  }

  console.log('✅ Created task categories')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📧 Admin Login Credentials:')
  console.log('   Email: admin@campaign.com')
  console.log('   Password: admin123')
  console.log('\n🚀 You can now start the development server with: npm run dev')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })