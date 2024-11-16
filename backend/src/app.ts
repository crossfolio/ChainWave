import express, { Request, Response } from 'express'
import './controllers/CronJobController'
import swaggerDocument from '../dist/swagger.json'
import swaggerUi from 'swagger-ui-express'
import dotenv from 'dotenv'
import { RegisterRoutes } from './routes/routes'
import { errorHandler } from './middlewares/errorHandler'

dotenv.config()

const app = express()

// TODO: add cors

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
