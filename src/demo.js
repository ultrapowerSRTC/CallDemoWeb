
let {WebSDK,Channel}  = window.WEBSDK;

let video = document.getElementById('video');
let streams = new Map();

function joinChannel() {

    let uccId = document.getElementById('uccId').value;
    let channelName = document.getElementById('channelName').value;
    let role = document.getElementById('role').value;
    let profile = document.getElementById('profile').value;

    let appKey = Config.appKey
    let appSecret = Config.appSecret;
    let nonce = uccId;
    let curTime = (Date.parse(new Date())).toString();
    let checkSum = SHA1(appSecret+nonce+curTime);
    let type = Config.loginMode;

    WebSDK.init({
        onSuccess:(code,desc) => {},
        onFailure:(code,desc) => {}
    });

    WebSDK.setRootServerUrl(Config.serverUrl);

    WebSDK.login({
        appKey:appKey,
        uccId:uccId,
        type:type,
        nonce:nonce,
        token:uccId,
        curTime:curTime,
        checkSum:checkSum,
        onSuccess: (code,res) => {

            Channel.join({
                channelKey:channelName,
                role:role,
                channelName:channelName,
                profile:profile,
                to:null,
                onSuccess: (code,res) => {
                    registerListen();
                    let videoId = 'video_'+uccId;
                    let lovalVideo = document.createElement('video');
                    lovalVideo.id = videoId;
                    lovalVideo.style.width = '300px';
                    lovalVideo.style.height = '200px';
                    lovalVideo.style.backgroundColor = '#000';
                    video.appendChild(lovalVideo)
                    Channel.playMedia({
                        uccId:uccId,
                        elementId:videoId,
                        onSuccess: (code) => {
                            console.log('playMedia success !!',res);
                        },
                        onFailure: (code,desc) => {
                            console.log('playMedia failure !!',desc);
                        }
                    });
                },
                onFailure: (code,err) => {
                    console.error('join failure !!',err);
                }
            })

        },
        onFailure: (code,err) => {
            console.error('login failure !!',err);
        }
    });
}

function registerListen() {
    Channel.on('user-join',(uccId) => {
        console.log('listen user join ',uccId);
    });
    Channel.on('user-leave',(uccId) => {
        console.log('listen user leave: ',uccId);
        if(streams.has(uccId)){
            streams.delete(uccId)
        }
        if(video.children.hasOwnProperty('video_'+uccId)){
            document.getElementById('video_'+uccId).remove()
        }
    });
    Channel.on('stream-publish',(stream) => {
        let uccId = stream.getId();
        streams.set(uccId,stream)
    });
    Channel.on('stream-add',(stream) => {
        console.log('listen stream add ');
        let uccId = stream.getId();
        streams.set(uccId,stream)
        let videoId = 'video_'+uccId;
        let remoteVideo = document.createElement('video');
        remoteVideo.id = videoId;
        remoteVideo.style.width = '300px';
        remoteVideo.style.height = '200px';
        remoteVideo.style.backgroundColor = '#000';
        video.appendChild(remoteVideo)
        Channel.playMedia({
            uccId:uccId,
            elementId:videoId,
            onSuccess: (code) => {
                console.log('listen stream add and playmedia');
            },
            onFailure: (code,desc) => {
                console.error('listen stream add and playmedia failure!',desc);
            }
        });
    });
    Channel.on('speaking',(speaking) => {
        console.log(speaking);
    })
    Channel.on('kickout',(res) => {
        if(res.code == 1){
            console.warn('主持人已退出');
        }
        if(res.code == 2){
            console.warn('一个房间只能有一个主持人，你被踢出去了');
        }
        if(res.code == 3){
            console.warn('你被提出房间');
        }
    })
    Channel.on('error',(err) => {
        console.error('error >>>',err);
    })
    Channel.on('disconnect',() => {
        console.warn('disconnect');
    })
}

function leaveChannel() {
    Channel.leave({
        onSuccess:(code,desc) => {
            video.innerHTML = null;
        },
        onFailure:(code,err) => {

        }
    })
}

document.getElementById('join').onclick = joinChannel;
document.getElementById('leave').onclick = leaveChannel;
