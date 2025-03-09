import { rest } from 'msw'

export const handlers = [
  rest.get('/api/workout', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 'workout-1', name: 'Mocked Workout 1', days: [] },
        { id: 'workout-2', name: 'Mocked Workout 2', days: [] }
      ])
    )
  }),
  
  rest.get('/api/workout/:id', (req, res, ctx) => {
    const { id } = req.params
    return res(
      ctx.status(200),
      ctx.json({
        id,
        name: `Mocked Workout ${id}`,
        days: []
      })
    )
  }),
  
  rest.post('/api/workout', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ id: 'new-workout', name: 'New Workout', days: [] })
    )
  }),
  
  rest.put('/api/workout/:id', (req, res, ctx) => {
    const { id } = req.params
    return res(
      ctx.status(200),
      ctx.json({ id, ...req.body })
    )
  }),
  
  rest.delete('/api/workout/:id', (req, res, ctx) => {
    return res(ctx.status(204))
  })
] 