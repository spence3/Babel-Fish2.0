const express = require('express')
const app = express()
const http = require('http')
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({model:"gemini-1.5-flash"})

const server = http.createServer(app)

//any url can access our backedn url
const io = require('socket.io')(server, {
    cors: {origin:"*"}
})

function run(){
    io.on('connection', (socket) => {
        console.log('user connected')
        socket.on('message', async (messageInfo) => {
            try{
                console.log(messageInfo.translate, 'testing translate')
                // console.log(`message before translation ${message}`)
                const prompt = `only respond with ${messageInfo.message} translated into ${messageInfo.translate}`
                const result = await model.generateContent(prompt)
                console.log('message', `${socket.id.substr(0,2)} said: ${messageInfo.message} \n Translation: ${result.response.text()}.`)
                await io.emit('message', `${socket.id.substr(0,2)} said: ${messageInfo.message}\n${result.response.text()}.`)
            }
            catch(error){
                console.error("error with translate!", error)
            }
            
        })
    })
}
    

server.listen(8000, () => {
    console.log('server running on http://localhost:8000')
    run()
})