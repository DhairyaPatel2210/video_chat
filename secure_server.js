const fs = require("fs") 

const options = {
    key: fs.readFileSync('./security/cert.key'),
    cert: fs.readFileSync('./security/cert.pem') 
}

const express = require('express')
const { Socket } = require('socket.io')
const app = express()
const server = require('https').Server(options, app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const expressPeerServer = require('peer').ExpressPeerServer

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/',expressPeerServer(server,{
    debug:true, 
    path:'/myapp', 
    ssl: {
        ...options
    }}))

app.get("/",(req, res)=> {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', {roomId : req.params.room})
})

io.on('connection', (socket) => {
    socket.on('join-room',(roomId, userId)=>{
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)
        
        socket.on('disconnect',()=>{
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
})

server.listen(process.env.PORT || 3000)