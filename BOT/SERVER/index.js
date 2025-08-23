import express from 'express'
import {spawn} from 'child_process'
import cors from 'cors'

const app=express()

app.use(express.json())
app.use(cors())


app.get('/',(req,res)=>{
    res.send('HIIII from backend')
})

app.listen(5000,(req,res)=>{
    console.log(`Server successfully running on PORT 5000`)
})