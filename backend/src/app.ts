import express, { Request, Response } from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.get('/', (_req: Request, res: Response) => {
  res.status(200).send({
    message: 'Hello World!',
  })
})

export default app
