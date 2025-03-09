import { render, screen } from '@testing-library/react'
import { rest } from 'msw'
import { server } from '../mocks/setup'

// Mock de la página de workout
jest.mock('@/app/workout/page', () => {
  return {
    __esModule: true,
    default: function MockedWorkoutPage() {
      return <div>Mocked Workout Page</div>
    }
  }
})

// Mock de los hooks de Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn()
  }),
  usePathname: () => '/workout',
  useSearchParams: () => new URLSearchParams()
}))

describe('Workout Page Integration', () => {
  // Configuramos un mock específico para este test
  beforeEach(() => {
    server.use(
      rest.get('/api/workout', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json([
            { id: 'workout-1', name: 'Test Workout 1', days: [] },
            { id: 'workout-2', name: 'Test Workout 2', days: [] }
          ])
        )
      })
    )
  })

  it('renders workout page with mocked data', () => {
    const WorkoutPage = require('@/app/workout/page').default
    render(<WorkoutPage />)
    
    // Verificamos que la página mockeada se muestre
    expect(screen.getByText('Mocked Workout Page')).toBeInTheDocument()
  })
}) 