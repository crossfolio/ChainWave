import app from './app'
import { connectDatabase } from './config/database'

const PORT = process.env.PORT || 3000

connectDatabase()

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
