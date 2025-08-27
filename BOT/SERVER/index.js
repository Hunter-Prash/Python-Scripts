import express from 'express'
import {spawn} from 'child_process'
import cors from 'cors'
import axios from 'axios'

const app=express()

app.use(express.json())
app.use(cors())


app.get('/',(req,res)=>{
    res.send('HIIII from backend')
})

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    try {
        const response = await axios.post('http://127.0.0.1:8000/chat', { message });
        res.json({ reply: response.data.reply });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.listen(5000,"0.0.0.0",(req,res)=>{
    console.log(`Server successfully running on PORT 5000`)
})