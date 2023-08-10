$(document).ready(function () {
    const chatInputBox = document.getElementById("chat_message");
    const all_messages = document.getElementById("all_messages");
    const main__chat__window = document.getElementById("main__chat__window");
    const videoGrid = document.getElementById("video-grid");
    const myVideo = document.createElement("video");
    myVideo.id = "myVideo";
    myVideo.muted = true;
    const myId = $("#userId").attr("class");

    let myVideoStream;
    let remoteVideoStream; // To store the remote user's video stream
    let remoteVideoElement; // To store the remote user's video element

    var getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;

    navigator.mediaDevices
        .getUserMedia({
            video: true,
            audio: true,
        })
        .then((stream) => {
            myVideoStream = stream;
            addVideoStream(myVideo, stream);

            peer.on("call", (call) => {
                call.answer(stream);
                remoteVideoElement = document.createElement("video");

                call.on("stream", (userVideoStream) => {
                    remoteVideoStream = userVideoStream;
                    addVideoStream(remoteVideoElement, userVideoStream);
                });
            });

            socket.on("user-connected", (userId) => {
                connectToNewUser(userId, stream);
            });

            document.addEventListener("keydown", (e) => {
                if (e.which === 13 && chatInputBox.value != "") {

                    socket.emit("message", myId, chatInputBox.value);
                    chatInputBox.value = "";
                }
            });

            socket.on("createMessage", (id, msg) => {
                if (id == myId) {
                    $("#all_messages").append(`<li class="text-end text-success">${msg}</li>`);
                } else {
                    $("#all_messages").append(`<li class="text-danger">${msg}</li>`);
                }
                main__chat__window.scrollTop = main__chat__window.scrollHeight;
            });
        });

    peer.on("open", (id) => {
        socket.emit("join-room", ROOM_ID, id);
    });

    // CHAT

    const connectToNewUser = (userId, streams) => {
        if (!remoteVideoStream) {
            var call = peer.call(userId, streams);
            remoteVideoElement = document.createElement("video");
            remoteVideoElement.id = "remotevideo";
            call.on("stream", (userVideoStream) => {
                remoteVideoStream = userVideoStream;
                addVideoStream(remoteVideoElement, userVideoStream);
            });
        }
    };

    const addVideoStream = (videoEl, stream) => {
        videoEl.srcObject = stream;
        videoEl.addEventListener("loadedmetadata", () => {
            videoEl.play();
        });

        if (videoGrid.childElementCount < 2) {
            videoGrid.append(videoEl);
        }
    };


    $(document).on('click', "#playPauseVideo", function () {
        let enabled = myVideoStream.getVideoTracks()[0].enabled;
        if (enabled) {
            myVideoStream.getVideoTracks()[0].enabled = false;
            setPlayVideo();
        } else {
            setStopVideo();
            myVideoStream.getVideoTracks()[0].enabled = true;
        }
    });

    $(document).on('click', "#muteButton", function () {
        const enabled = myVideoStream.getAudioTracks()[0].enabled;
        if (enabled) {
            myVideoStream.getAudioTracks()[0].enabled = false;
            setUnmuteButton();
        } else {
            setMuteButton();
            myVideoStream.getAudioTracks()[0].enabled = true;
        }
    });

    const setPlayVideo = () => {
        const html = `<i class="unmute fa fa-pause-circle"></i>
  <span class="unmute">Resume Video</span>`;
        document.getElementById("playPauseVideo").innerHTML = html;
    };

    const setStopVideo = () => {
        const html = `<i class=" fa fa-video-camera"></i>
  <span class="">Pause Video</span>`;
        document.getElementById("playPauseVideo").innerHTML = html;
    };

    const setUnmuteButton = () => {
        const html = `<i class="unmute fa fa-microphone-slash"></i>
  <span class="unmute">Unmute</span>`;
        document.getElementById("muteButton").innerHTML = html;
    };
    const setMuteButton = () => {
        const html = `<i class="fa fa-microphone"></i>
  <span>Mute</span>`;
        document.getElementById("muteButton").innerHTML = html;
    };

    $(document).one('click', ('#call-end , #call-end-modal'), function () {
        peer.destroy();
        delete peer;
        const roomId = $("#call-end").data("roomid");
        const receiver = $("#P2P-video-call").data("id");
        $.ajax({
            type: "get",
            url: `/users/P2P-video-call/${roomId}`,
            data: {
                status: "disconnect"
            },
            success: function (response) {
                if (response.status == "200" || response.status == 200) {
                    socket.emit("call-disconnect", { roomId: ROOM_ID, receiver: receiver });
                }
            },
            error: function (error) {
                toastr.error(error.responseJSON.message).delay(2000).fadeOut(1000);
            }
        });
    });
    socket.on("call-disconnect", () => {
        if (myVideoStream) {
            // disable/stop camera and mic
            myVideoStream.getTracks().forEach(track => track.stop());
        }
    });
});