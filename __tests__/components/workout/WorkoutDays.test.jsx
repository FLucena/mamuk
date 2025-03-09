import { render, screen, fireEvent, act } from '@testing-library/react'
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
  onAddDay: jest.fn().mockImplementation(() => Promise.resolve()),
  onAddBlock: jest.fn().mockImplementation(() => Promise.resolve()),
  onAddExercise: jest.fn().mockImplementation(() => Promise.resolve()),
  onUpdateDayName: jest.fn(),
  onUpdateBlockName: jest.fn(),
}

describe('WorkoutDays Component', () => {
  it('renders days correctly', () => {
    render(<WorkoutDays days={mockDays} {...mockFunctions} />)
    expect(screen.getByText('Day 1')).toBeInTheDocument()
    // Nota: Block 1 y Exercise 1 no son visibles inicialmente porque los días están colapsados por defecto
  })

  it('calls onAddDay when add day button is clicked', async () => {
    render(<WorkoutDays days={mockDays} {...mockFunctions} />)
    const addButton = screen.getByText('Agregar día')
    
    await act(async () => {
      fireEvent.click(addButton)
    })
    
    expect(mockFunctions.onAddDay).toHaveBeenCalled()
  })
}) 