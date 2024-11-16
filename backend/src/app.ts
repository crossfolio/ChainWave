import express, { NextFunction, Request, RequestHandler, Response } from 'express'
import './controllers/CronJobController'
import swaggerDocument from '../dist/swagger.json'
import swaggerUi from 'swagger-ui-express'
import dotenv from 'dotenv'
import { RegisterRoutes } from './routes/routes'
import { errorHandler } from './middlewares/errorHandler'

dotenv.config()

const app = express()

// CORS
const cors: RequestHandler = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
    return 
  }
  next()
}
app.use(cors)

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
