import Papa from 'papaparse'

export interface CSVParseResult<T> {
  data: T[]
  errors: string[]
  meta: {
    fields: string[]
    rowCount: number
  }
}

export function parseCSV<T>(file: File): Promise<CSVParseResult<T>> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          data: results.data as T[],
          errors: results.errors.map(error => error.message),
          meta: {
            fields: results.meta.fields || [],
            rowCount: results.data.length
          }
        })
      }
    })
  })
}

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  fields?: string[]
): void {
  const csv = Papa.unparse(data, {
    fields: fields
  })
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Volunteer CSV template and validation
export interface VolunteerCSVRow {
  name: string
  email: string
  phone?: string
  address?: string
  skills?: string
  availability?: string
  notes?: string
}

export function validateVolunteerCSV(data: any[]): { valid: VolunteerCSVRow[], invalid: { row: any, errors: string[] }[] } {
  const valid: VolunteerCSVRow[] = []
  const invalid: { row: any, errors: string[] }[] = []
  
  data.forEach(row => {
    const errors: string[] = []
    
    if (!row.name || typeof row.name !== 'string' || row.name.trim() === '') {
      errors.push('Name is required')
    }
    
    if (!row.email || typeof row.email !== 'string' || !isValidEmail(row.email)) {
      errors.push('Valid email is required')
    }
    
    if (errors.length > 0) {
      invalid.push({ row, errors })
    } else {
      valid.push({
        name: row.name.trim(),
        email: row.email.trim().toLowerCase(),
        phone: row.phone?.trim() || undefined,
        address: row.address?.trim() || undefined,
        skills: row.skills?.trim() || undefined,
        availability: row.availability?.trim() || undefined,
        notes: row.notes?.trim() || undefined,
      })
    }
  })
  
  return { valid, invalid }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function getVolunteerCSVTemplate(): string {
  const template = [
    ['name', 'email', 'phone', 'address', 'skills', 'availability', 'notes'],
    ['John Doe', 'john@example.com', '+1234567890', '123 Main St, City, State', 'Phone banking, Canvassing', 'Weekends, Evenings', 'Experienced volunteer'],
    ['Jane Smith', 'jane@example.com', '+0987654321', '456 Oak Ave, City, State', 'Event planning, Social media', 'Weekdays', 'Great with organizing events']
  ]
  
  return Papa.unparse(template)
}