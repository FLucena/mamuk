import { formatCreatedAt, formatShortDate, formatDateTime } from '@/lib/utils/dates'

describe('Date Utilities', () => {
  const testDate = new Date('2023-05-20T12:30:00Z')

  it('formatCreatedAt returns readable date', () => {
    const formatted = formatCreatedAt(testDate)
    expect(formatted).toMatch(/\d{1,2} de [a-zA-Z]+ de \d{4}/)
  })

  it('formatShortDate returns date in short format', () => {
    const formatted = formatShortDate(testDate)
    expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
  })

  it('formatDateTime returns date with time', () => {
    const formatted = formatDateTime(testDate)
    expect(formatted).toMatch(/\d{1,2} de [a-zA-Z]+ de \d{4}, \d{1,2}:\d{2}/)
  })
}) 