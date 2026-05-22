import express from 'express'
const app=express()
app.use(express.json())
import userRoutes from './src/routes/user.routes.js'
app.use('/api/v2/user',userRoutes)
export {app}
