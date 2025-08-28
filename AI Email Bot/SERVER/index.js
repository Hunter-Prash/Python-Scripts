import express from 'express'
import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

const app=express()

app.get('/',(req,res)=>{
    res.send('Hii from backend!@')
})

//go to oauth consent screen
app.get('/auth/google',(req,res)=>{
    
})

app.listen(5100,(req,res)=>{
    console.log('Server successfully started on port 5100')
})