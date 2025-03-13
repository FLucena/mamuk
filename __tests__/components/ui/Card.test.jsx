import { render, screen } from '@testing-library/react'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'

describe('Card Components', () => {
  it('renders Card with children', () => {
    render(<Card><div>Card content</div></Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders CardHeader correctly', () => {
    render(<CardHeader><h2>Header</h2></CardHeader>)
    expect(screen.getByText('Header')).toBeInTheDocument()
  })

  it('applies custom className to Card', () => {
    const { container } = render(<Card className="custom-class">Content</Card>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
}) 