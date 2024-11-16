import express, { Request, Response } from 'express'
import './controllers/CronJobController'
import swaggerDocument from '../dist/swagger.json'
import swaggerUi from 'swagger-ui-express'
import dotenv from 'dotenv'
import cors from 'cors'
import { RegisterRoutes } from './routes/routes'
import { errorHandler } from './middlewares/errorHandler'

dotenv.config()

const app = express()

const isDev = process.env.NODE_ENV === 'development'
const corsWhitelist = isDev
  ? [
      `http://localhost:${process.env.PORT}`,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ]
  : process.env.CORS_ORIGIN_WHITELIST?.split(',') || []
app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || corsWhitelist.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
  }),
)

// Middleware
app.use(express.json())

app.get('/', (_req: Request, res: Response) => {
  res.status(200).send({
    message: 'Hello World!',
  })
})

// Swagger
app.use('/api/docs', swaggerUi.serve, async (_req: Request, res: Response) => {
  res.send(swaggerUi.generateHTML(swaggerDocument))
})

// TSOA Routes
RegisterRoutes(app)

// Error Handling Middleware
app.use(errorHandler)

export default app
