require('dotenv').config();
const express =require('express');
const cors = require('cors');
const connectdb = require('./config/db.js')

const app = express();

app.get('/',(req,res)=>{
    res.send("Server is listening...");    
})

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`🚀 Server running on PORT : http://localhost:${PORT} `)
    connectdb();
})