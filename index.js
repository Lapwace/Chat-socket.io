const express = require("express")
const app = express()
const cors = require("cors")
const ytdl = require("ytdl-core")
const path = require("path")
app.use(express.static(path.join(__dirname)))
const http = require("http").createServer(app)
const io = require("socket.io")(http)
app.get("/", (req, res) => {res.sendFile(__dirname + "/index.html")})
app.use(cors())
let how_online = 0
let current_channel = 

app.get("/download", (req,res) =>{
    var URL = req.query.URL
    res.header("Content-Disposition", 'attachment; filename=video.mp4')

    ytdl(URL,{
        format: 'mp4',
        quality: 'highestvideo',
        quality: 'highestaudio'
    }).pipe(res)
})

io.on("connection", (socket) =>{
    how_online++
    io.emit("how_online", how_online)
    io.to(socket.id).emit("video_inj")



    socket.on("disconnect", () => {
        how_online = how_online - 1
        io.emit("how_online", how_online)
    })

    socket.on("enter_room", (room, current) => {
        const check_channel = socket.rooms.has(room)
        if(!check_channel) {
            if(current != socket.id){
                socket.leave(current)
            }
            socket.join(room)
            current_channel = io.sockets.adapter.rooms.get(room).size
            io.in(room).emit("change_current", current_channel)
            io.in(room).emit("name_room", room, current_channel, room)
            io.to(socket.id).emit("delete_message", "", current_channel)

        }
    })

    socket.on("private_req", (room) =>{
        if(room != socket.id){
            socket.leave(room)
            current_channel = io.sockets.adapter.rooms.get(socket.id).size
            io.in(socket.id).emit("change_current", current_channel)
            io.to(socket.id).emit("name_room", socket.id, current_channel, "Private")
            io.to(socket.id).emit("delete_message", "", current_channel)
        }
    })
    
    socket.on("private_go", (userID, room) =>{
        if(socket.id != userID){
            socket.leave(room)
            socket.join(userID)
            current_channel = io.sockets.adapter.rooms.get(userID).size
            io.in(userID).emit("change_current", current_channel)
            io.to(socket.id).emit("name_room", userID, current_channel, "Private")
            io.to(socket.id).emit("delete_message", "", current_channel)
        }

    })

    socket.on("chat_message", (msg) => {
        io.in(msg.room).emit("received_message", msg, socket.id)
        io.to(socket.id).emit("delete_message", msg, current_channel)
        io.in(msg.room).emit("change_current", current_channel)
    })

    socket.on("youtube_player", (link, urlYT) =>{
        io.to(socket.id).emit("youtube_edite", link, urlYT)
    })

})

http.listen(3000, () => {
    console.log("Server start")
})