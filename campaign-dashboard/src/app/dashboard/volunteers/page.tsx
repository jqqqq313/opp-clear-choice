'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { VolunteerList } from '@/components/volunteers/VolunteerList'
import { AddVolunteerModal } from '@/components/volunteers/AddVolunteerModal'
import { VolunteerWithTasks, CreateVolunteerForm } from '@/types'

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerWithTasks[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchVolunteers()
  }, [])

  const fetchVolunteers = async () => {
    try {
      const response = await fetch('/api/volunteers')
      if (response.ok) {
        const data = await response.json()
        setVolunteers(data)
      }
    } catch (error) {
      console.error('Error fetching volunteers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddVolunteer = async (volunteerData: CreateVolunteerForm) => {
    try {
      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(volunteerData),
      })

      if (response.ok) {
        const newVolunteer = await response.json()
        setVolunteers(prev => [newVolunteer, ...prev])
        setIsAddModalOpen(false)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add volunteer')
      }
    } catch (error) {
      console.error('Error adding volunteer:', error)
      throw error
    }
  }

  const handleEditVolunteer = (volunteer: VolunteerWithTasks) => {
    // TODO: Implement edit volunteer functionality
    console.log('Edit volunteer:', volunteer)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <VolunteerList
        volunteers={volunteers}
        onAddVolunteer={() => setIsAddModalOpen(true)}
        onEditVolunteer={handleEditVolunteer}
      />
      
      <AddVolunteerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddVolunteer}
      />
    </DashboardLayout>
  )
}