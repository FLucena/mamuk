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
        description: 'This is a mocked workout',
        days: [
          {
            name: 'Day 1',
            blocks: [
              {
                name: 'Block 1',
                exercises: [
                  { name: 'Mocked Exercise', sets: 3, reps: '10' }
                ]
              }
            ]
          }
        ]
      })
    )
  }),
  
  rest.post('/api/workout', (req, res, ctx) => {
    const data = req.body
    return res(
      ctx.status(201),
      ctx.json({
        id: 'new-workout-id',
        ...data,
        createdAt: new Date().toISOString()
      })
    )
  })
] 