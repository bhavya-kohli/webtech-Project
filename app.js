const express=require("express");
const app=express();
const server=require('http').Server(app);
const io=require('socket.io')(server);
const {ExpressPeerServer}=require('peer');
const peerServer=ExpressPeerServer(server,{
    debug:true,
});

app.use(express.static('public'));
app.set('view engine','ejs');
app.use('/peerjs',peerServer);


app.get('/',(req,res)=>{
    var array=new Uint32Array(10);
    console.log(array);
    //console.log(Math.random(array));
    var room_id=Math.floor(Math.random(array)*100000);
    console.log(room_id);
    res.redirect(`/${room_id}`);
})

app.get('/:room_id',async(req,res)=>{
    res.render('chatroom',{chat_room_id:req.params.room_id})
})

io.on('connection',socket=>{
    socket.on('join-room',(roomId,userId)=>{
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected',userId);
       
    socket.on("message",message=>{
        io.to(roomId).emit('createMessage',message);
    })    

    socket.on("disconnect",()=>{
        socket.to(roomId).broadcast.emit("user-dissconnected",userId);
    });
});
});

server.listen(process.env.PORT || 3000);