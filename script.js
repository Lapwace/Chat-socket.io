const socket = io()
let current_room = "OneForAllChat"
let current_online = 0
let current_channel = 0

socket.on("connect", () =>{
    socket.emit("enter_room", "OneForAllChat")
})
function inj_pannel_how(totalonline, channelonline){
    document.querySelector("#how_online").innerHTML = `<p>Currently online : ${totalonline}<p> Currently on channel : ${channelonline}`
}

window.onload = () => {
      
    document.querySelector("#send_form").addEventListener("click", (e) => {
        e.preventDefault()
        const name = document.querySelector("#name")
        const message = document.querySelector("#message") 
        socket.emit("chat_message", {name: name.value, message: message.value, room: current_room})
    })

    document.querySelector("#channel_entry").addEventListener("click", (e) => {
        e.preventDefault()
        const channel = document.querySelector("#channel_text")
        let sec_channel = 0
        notsec_channel = String(channel.value)
        for (i = 0; i < notsec_channel.length; i++){
            if (notsec_channel[i] == "<" ){
                sec_channel = 1
            }
        }
        if (sec_channel == 0 && notsec_channel != "" && notsec_channel != current_room){  
            document.querySelector("#messages").innerHTML = ""  
            socket.emit("enter_room", channel.value, current_room)
            current_room = channel.value
        }
    })

    document.querySelector("#youtube_button").addEventListener("click", (e) => {
        e.preventDefault()
        const videoID = document.querySelector("#youtube_url")
        let sec_youtube = 0
        notsec_youtube = String(videoID.value)
        urlYT = "https://www.youtube.com/watch?v="+videoID.value
        link = "https://www.youtube.com/embed/"+videoID.value+"?loop=1&playlist="+videoID.value
        for (i = 0; i < notsec_youtube.length; i++){
            if (notsec_youtube[i] == "<" ){
                sec_youtube = 1
            }
        }
        if (sec_youtube == 0 && notsec_youtube != "" ){  
        socket.emit("youtube_player", link, urlYT)
        }
    })

    socket.on("youtube_edite", (link, urlYT) =>{
        document.querySelector("#ytplayer").innerHTML = `<iframe id="player_youtube" type="text/html" src="${link}" frameborder="0"></iframe><br><button id="download">Download</button>`
        document.querySelector("#download").addEventListener("click", (e) => {
            e.preventDefault()
            window.location.href = `http://localhost:3000/download?URL=${urlYT}`
        })
    })
    
    socket.on("video_inj", () => {
        document.querySelector("#ytplayer").innerHTML = `<iframe id="player_youtube" type="text/html" src="https://www.youtube.com/embed/jNQXAC9IVRw" frameborder="0"></iframe><br><button id="download">Download</button>`
    })

    socket.on("how_online", (how_online) => {
        current_online = how_online
        inj_pannel_how(current_online, current_channel)
    })

    socket.on("name_room", (room, on_channel) => {
        current_channel = on_channel
        inj_pannel_how(current_online, current_channel)
        document.querySelector("#title_name").innerHTML = `${room}`
    })

    socket.on("received_message", (msg) => {
        let sec_send = 0
        let notsec_message = String(msg.message)
        for (i = 0; i < notsec_message.length; i++){
            if (notsec_message[i] == "<" ){
                sec_send = 1
            }
        }
        let notsec_name = String(msg.name)
        for (i = 0; i < notsec_name.length; i++){
            if (notsec_name[i] == "<"){
                sec_send = 1
            }
        }  
        if(msg.name != "" && notsec_message != "" && sec_send == 0){
            document.querySelector("#messages").innerHTML = `<p>${msg.name} : ${msg.message}</p>` + document.querySelector("#messages").innerHTML
        }
    })
    
    socket.on("delete_message", () => {
        document.querySelector("#message").value = ""
    })
}