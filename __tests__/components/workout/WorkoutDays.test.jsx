import { render, screen, fireEvent } from '@testing-library/react'
import WorkoutDays from '@/components/workout/WorkoutDays'

const mockDays = [
  {
    name: 'Day 1',
    blocks: [
      {
        name: 'Block 1',
        exercises: [
          { name: 'Exercise 1', sets: 3, reps: '10', rest: 60 }
        ]
      }
    ]
  }
]

const mockFunctions = {
  onAddDay: jest.fn(),
  onAddBlock: jest.fn(),
  onAddExercise: jest.fn(),
  onUpdateDayName: jest.fn(),
  onUpdateBlockName: jest.fn(),
}

describe('WorkoutDays Component', () => {
  it('renders days correctly', () => {
    render(<WorkoutDays days={mockDays} {...mockFunctions} />)
    expect(screen.getByText('Day 1')).toBeInTheDocument()
    expect(screen.getByText('Block 1')).toBeInTheDocument()
    expect(screen.getByText('Exercise 1')).toBeInTheDocument()
  })

  it('calls onAddDay when add day button is clicked', async () => {
    render(<WorkoutDays days={mockDays} {...mockFunctions} />)
    const addButton = screen.getByRole('button', { name: /añadir día/i })
    fireEvent.click(addButton)
    expect(mockFunctions.onAddDay).toHaveBeenCalled()
  })
}) 