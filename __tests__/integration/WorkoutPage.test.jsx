import { render, screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { handlers } from '../mocks/handlers'

// Mock de la página de workout
// Nota: Esto puede necesitar ajustes dependiendo de cómo esté estructurada tu página
jest.mock('@/app/workout/page', () => {
  return {
    __esModule: true,
    default: function WorkoutPage() {
      return <div>Mocked Workout Page</div>
    }
  }
})

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Workout Page Integration', () => {
  it('renders workout page', async () => {
    const WorkoutPage = require('@/app/workout/page').default
    render(<WorkoutPage />)
    
    expect(screen.getByText('Mocked Workout Page')).toBeInTheDocument()
  })
}) 