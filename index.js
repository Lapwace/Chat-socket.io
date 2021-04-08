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
    how_online = how_online + 1
    io.emit("how_online", how_online)
    io.to(socket.id).emit("video_inj")


    socket.on("disconnect", () => {
        how_online = how_online - 1
        io.emit("how_online", how_online)
    })

    socket.on("enter_room", (room, current) => {
        const check_channel = socket.rooms.has(room)
        if(!check_channel) {
            socket.leave(current)
            socket.join(room)
            current_channel = io.sockets.adapter.rooms.get(room).size
            io.to(socket.id).emit("name_room", room, current_channel)
        }
    })

    socket.on("chat_message", (msg) => {
        io.in(msg.room).emit("received_message", msg)
        io.to(socket.id).emit("delete_message", msg)
    })

    socket.on("youtube_player", (link, urlYT) =>{
        io.to(socket.id).emit("youtube_edite", link, urlYT)
    })

})

http.listen(3000, () => {
    console.log("Server start")
})