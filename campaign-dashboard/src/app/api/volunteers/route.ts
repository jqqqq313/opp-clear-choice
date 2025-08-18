import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateVolunteerForm } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, get all volunteers. In production, filter by user's campaigns
    const volunteers = await prisma.volunteer.findMany({
      include: {
        tasks: true,
        eventRSVPs: true,
        taskCheckIns: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Parse JSON strings back to arrays
    const parsedVolunteers = volunteers.map(volunteer => ({
      ...volunteer,
      skills: JSON.parse(volunteer.skills || '[]'),
      availability: JSON.parse(volunteer.availability || '[]'),
    }))

    return NextResponse.json(parsedVolunteers)
  } catch (error) {
    console.error('Error fetching volunteers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateVolunteerForm = await request.json()

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Check if email already exists
    const existingVolunteer = await prisma.volunteer.findFirst({
      where: { email: body.email }
    })

    if (existingVolunteer) {
      return NextResponse.json({ error: 'A volunteer with this email already exists' }, { status: 400 })
    }

    // For now, use a default campaign. In production, get from user's active campaign
    let campaignId = 'default-campaign'
    
    // Try to get or create a default campaign
    let campaign = await prisma.campaign.findFirst()
    if (!campaign) {
      campaign = await prisma.campaign.create({
        data: {
          name: 'Default Campaign',
          description: 'Default campaign for development'
        }
      })
    }
    campaignId = campaign.id

    const volunteer = await prisma.volunteer.create({
      data: {
        campaignId,
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        address: body.address || null,
        skills: JSON.stringify(body.skills || []),
        availability: JSON.stringify(body.availability || []),
        notes: body.notes || null,
      },
      include: {
        tasks: true,
        eventRSVPs: true,
        taskCheckIns: true,
      }
    })

    // Parse JSON strings back to arrays for response
    const parsedVolunteer = {
      ...volunteer,
      skills: JSON.parse(volunteer.skills || '[]'),
      availability: JSON.parse(volunteer.availability || '[]'),
    }

    return NextResponse.json(parsedVolunteer, { status: 201 })
  } catch (error) {
    console.error('Error creating volunteer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}