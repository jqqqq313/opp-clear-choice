import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Initializing database...')

  // Create a default campaign
  const campaign = await prisma.campaign.upsert({
    where: { name: 'Default Campaign' },
    update: {},
    create: {
      name: 'Default Campaign',
      description: 'Default campaign for development',
      primaryColor: '#3B82F6',
      secondaryColor: '#1F2937',
    },
  })

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
      phone: '+1234567890',
      skills: JSON.stringify(['Phone Banking', 'Canvassing']),
      availability: JSON.stringify(['Weekends', 'Evenings']),
      campaignId: campaign.id,
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
      skills: JSON.stringify(['Event Planning', 'Social Media']),
      availability: JSON.stringify(['Weekdays', 'Mornings']),
      campaignId: campaign.id,
    },
  ]

  for (const volunteer of sampleVolunteers) {
    await prisma.volunteer.upsert({
      where: { email: volunteer.email },
      update: {},
      create: volunteer,
    })
  }

  console.log('Database initialized successfully!')
  console.log('Admin login: admin@campaign.com / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })