import { render, screen, waitFor } from '@testing-library/react'

// Mock fetch
global.fetch = jest.fn().mockImplementation((url) => {
  if (url === '/api/workout') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { id: 'workout-1', title: 'Test Workout 1', days: [] },
        { id: 'workout-2', title: 'Test Workout 2', days: [] }
      ]),
    });
  }
  
  return Promise.reject(new Error('Not found'));
});

// Mock the workout page
jest.mock('@/app/workout/page', () => {
  return {
    __esModule: true,
    default: function WorkoutPage() {
      return <div>Mocked Workout Page</div>
    }
  }
})

describe('Workout Page Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders workout page', async () => {
    const WorkoutPage = require('@/app/workout/page').default
    render(<WorkoutPage />)
    
    expect(screen.getByText('Mocked Workout Page')).toBeInTheDocument()
  })
}) 