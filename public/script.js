const socket = io('/')
const videoGrid = document.getElementById("videos")


const myVideo = document.createElement('video')


myVideo.muted = true

const peers = []

if(navigator.mediaDevices.getUserMedia){
    navigator.mediaDevices.getUserMedia({
        video : true,
        audio : false
    }).then((stream) =>{
        const myPeer = new Peer(undefined, {
            host: 'localhost',
            path:'/',
            port: '3000'
        })
    
        myPeer.on('open', id=>{
            socket.emit('join-room', ROOM_ID, id)
            console.log("joining the room, my id: ", id);
        })
    
        addVideoStream(myVideo, stream)
        console.log("added our own stream")
    
        socket.on('user-connected', userId =>{
            const call = myPeer.call(userId, stream)
            peers[userId] = call
            console.log("calling to the user with userId : ", userId)
            const video = document.createElement('video')
            call.on('stream', userVideoStream =>{
                console.log("Stream coming from remote user")
                addVideoStream(video, userVideoStream)
                console.log("stream added to the screen")
            })
            call.on('close',()=>{
                video.remove()
            })
        })
    
        myPeer.on('call', (call) => {
            console.log("answered the call")
            call.answer(stream);
            const video = document.createElement('video')
            call.on('stream', remoteStream =>{
                addVideoStream(video, remoteStream)
            })
        })
    
        socket.on('user-disconnected', userId=>{
            if(peers[userId]) {
                peers[userId].close()
            }
        })
    })    
}else{
    console.log("hello")
}




const addVideoStream = (video, stream) =>{
    video.srcObject = stream
    video.addEventListener('loadedmetadata',()=>{
        video.play()
    })
    videoGrid.append(video)
}

