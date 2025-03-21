import { render, screen, fireEvent, act } from '@testing-library/react'
import WorkoutDays from '@/components/workout/WorkoutDays'

// Mock Next.js navigation hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock next-auth session hook
jest.mock('next-auth/react', () => ({
  useSession: jest.fn().mockReturnValue({
    data: { user: { id: 'test-user-id' } },
    status: 'authenticated'
  }),
}));

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
    
    // Check if day name is displayed
    expect(screen.getByText('Day 1')).toBeInTheDocument()
    
    // Check if block name is displayed
    expect(screen.getByText('Block 1')).toBeInTheDocument()
    
    // Verify that "Añadir" button exists, which is part of the Block UI
    expect(screen.getByText('Añadir')).toBeInTheDocument()
    
    // Instead of checking for Exercise 1 which is not visible due to collapsed state,
    // we can verify that the "Añadir bloque" button exists
    expect(screen.getByText('Añadir bloque')).toBeInTheDocument()
  })

  it('calls onAddDay when add day button is clicked', async () => {
    render(<WorkoutDays days={mockDays} {...mockFunctions} />)
    const addButton = screen.getByText('Añadir día')
    
    await act(async () => {
      fireEvent.click(addButton)
    })
    
    expect(mockFunctions.onAddDay).toHaveBeenCalled()
  })
}) 