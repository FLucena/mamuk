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
    
    // Use queryAllByText to handle multiple elements with the same text
    const blockElements = screen.queryAllByText('Block 1')
    expect(blockElements.length).toBeGreaterThan(0)
    // Check if at least one of the elements is visible
    expect(blockElements[0]).toBeVisible()
    
    // Check for Exercise 1 text in the hidden list
    // First, find all exercise lists
    const exerciseLists = screen.queryAllByTestId('exercise-list')
    expect(exerciseLists.length).toBeGreaterThan(0)
    
    // Then check if any of them contain Exercise 1
    let foundExercise = false
    exerciseLists.forEach(list => {
      if (list.textContent.includes('Exercise 1')) {
        foundExercise = true
      }
    })
    expect(foundExercise).toBe(true)
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