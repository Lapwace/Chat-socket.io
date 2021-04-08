const express = require("express")
const app = express()
const path = require("path")
app.use(express.static(path.join(__dirname)))
const http = require("http").createServer(app)
const io = require("socket.io")(http)
app.get("/", (req, res) => {res.sendFile(__dirname + "/index.html")})
let how_online = 0

io.on("connection", (socket) =>{

    how_online = how_online + 1
    io.emit("how_online", how_online)

    socket.on("disconnect", () => {
        how_online = how_online - 1
        io.emit("how_online", how_online)
    })

    socket.on("enter_room", (room, current) => {
        const check_channel = socket.rooms.has(room)
        if(!check_channel) {
            socket.leave(current)
            socket.join(room)
            io.to(socket.id).emit("name_room", room)
        }
    })

    socket.on("chat_message", (msg) => {
        io.in(msg.room).emit("received_message", msg)
        io.to(socket.id).emit("delete_message", msg)
    })

    socket.on("youtube_player", (link) =>{
        io.to(socket.id).emit("youtube_edite", link)
    })
})

http.listen(3000, () => {
    console.log("Le serveur est lancé")
})