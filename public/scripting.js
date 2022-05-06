const socket=io('/');
const video_grid=document.getElementById('video_grid');

var peer=new Peer(undefined,{
    path:'/peerjs',
    host:'/',
    port:'443'
});

let myvideoStream_obj;
const myVideo=document.createElement('video');

//myVideo.muted=true;

const peers={};

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true,
}).then(stream=>{
    myvideoStream_obj=stream;
    addVideoStreamtoframe(myVideo,stream);

    peer.on('call',call=>{
        call.answer(stream);
        const video=document.createElement('video');
        call.on('stream',userVideoStream=>{
            addVideoStreamtoframe(video,userVideoStream);
        })
    })
    socket.on('user-connected',userId=>{
        setTimeout(function(){
            connectToNewUser(userId,stream);
        },2000)
    })

    let msg=$('input');

    $('html').keydown((e)=>{
        if(e.which==13 && msg.val().length!=0){
            socket.emit('message',msg.val());
            msg.val('');
        }
    });

    socket.on('createMessage',message=>{
        $('ul').append(`<li class="message"><b><i class="far fa-user"></i>user</b><br>${message}</li>`);
        scrollToBottom();
    });

    

}).catch(e=>{
    console.log("Error:"+e);
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
  })

peer.on('open',id=>{
    socket.emit('join-room',chat_room_Id,id);
    console.log(id);
});

const connectToNewUser=(userId,stream)=>{
    const call=peer.call(userId,stream);
    const video=document.createElement('video');
    call.on('stream',userVideoStream=>{
        addVideoStreamtoframe(video,userVideoStream);
    })
    call.on('close',()=>{
        video.remove();
    })
    peers[userId]=call;
}


const addVideoStreamtoframe=(videoframe,stream)=>{
    videoframe.srcObject=stream;
    //as peer uses session medadata and candidate signaling
    //we we need to load meda data event listener
    videoframe.addEventListener('loadedmetadata',()=>{
        videoframe.play();
    })
    video_grid.append(videoframe);

}

const scrollToBottom=()=>{
    var control=$('app_chat_window');
    control.scrollTop(control.prop('scrollHeight'));
}

const muteUnmute=()=>{
    const enablecommand=myvideoStream_obj.getAudioTracks()[0].enabled;
    console.log(enablecommand);
    if(enablecommand){
        myvideoStream_obj.getAudioTracks()[0].enabled=false;
        UnMuteButtonconfig();
    }else{
        MuteButtonconfig();
        myvideoStream_obj.getAudioTracks()[0].enabled=true;
    }
}

const MuteButtonconfig=()=>{
    const virtual=`<i class="fas fa-microphone"></i>
    <span>Mute</span>`
    document.querySelector('.app_mute_button').innerHTML=virtual;
}

const UnMuteButtonconfig=()=>{
    const virtual=`<i class=" unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>`
    document.querySelector('.app_mute_button').innerHTML=virtual;
}

const videoplaypause=()=>{
    var enablecommand=myvideoStream_obj.getVideoTracks()[0].enabled;
    if(enablecommand){
        myvideoStream_obj.getVideoTracks()[0].enabled=false;
        PauseVideoLogoConfig();
    }else{
        PlayVideoLogoConfig();
        myvideoStream_obj.getVideoTracks()[0].enabled=true;
    }
}

const PauseVideoLogoConfig=()=>{
    const virtual=`<i class=" pause fas fa-video-slash"></i>
    <span>Play video</span>`
    document.querySelector('.app_video_button').innerHTML=virtual;
}

const PlayVideoLogoConfig=()=>{
    const virtual=`<i class="fas fa-video"></i>
    <span>Stop video</span>`
    document.querySelector('.app_video_button').innerHTML=virtual;
}

document.getElementById('close-window').addEventListener('click',()=>{window.close();});

