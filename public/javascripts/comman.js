if (localStorage.getItem("theme-mode")) {
    $("body").addClass("theme-dark");
    const darkModeToggle = document.getElementById('toggle_checkbox');
    darkModeToggle.checked = true;
}

function getUserProfile(userId) {
    return window.location.href = `/users/profile/${userId}`
}

function sendFollowRequest(userId) {
    var requestStatus;
    $.ajax({
        type: "post",
        url: `/users/${userId}/followers/requested`,
        async: false,
        success: function (response) {
            toastr.success(response.message).delay(1500).fadeOut(1000);
            if (response.status == "201") {
                requestStatus = "Following";
            }
            else {
                requestStatus = "Requested";
            }
        },
        error: function (error) {
            toastr.error(error.responseJSON.message).delay(1500).fadeOut(1000);
        }
    });
    return requestStatus;
}

$("#day-night-toggle").on("click", function () {
    $("body").toggleClass("theme-dark");
    if ($("body").hasClass("theme-dark")) {
        localStorage.setItem("theme-mode", "theme-dark");
    } else {
        localStorage.setItem("theme-mode", "");
    }
});

$(document).on("click", ("#P2P-video-call , #call-accept"), function () {
    $("#incoming-call-modal").modal('hide');
    let url = `/users/P2P-video-call/`;
    const roomId = $(this).attr("data-roomid");
    if (roomId) {
        url = url + roomId;
    }
    audio.pause();
    audio.currentTime = 0;
    const receiver = $(this).data("id");
    if (receiver == "64ba6af81ebfa6cb3b079690") {
        toastr.info("You need to by premium for this action !").delay(2000).fadeOut(1000);
        return;
    }
    $(this).addClass("text-success");
    $.ajax({
        type: "get",
        url: url,
        data: {
            receiver: receiver
        },
        success: function (response) {
            $("#video-call-loader").html(response);
            $("#video-call-modal").modal('show');
        },
        error: function (error) {
            toastr.error(error.responseJSON.message).delay(2000).fadeOut(1000);
        }
    });
});

$(document).on("click", "#call-reject", function () {
    const receiver = $(this).data("id");
    const roomId = $(this).attr("data-roomid");
    let url = `/users/P2P-video-call/${roomId}`;
    audio.pause();
    audio.currentTime = 0;
    $.ajax({
        type: "get",
        url: url,
        data: {
            receiver: receiver,
            status: "rejected"
        },
        success: function (response) {
            $("#incoming-call-modal").modal('hide');
            $("#P2P-video-call").removeAttr("data-roomid");
            $("#P2P-video-call").removeClass("text-success");
        },
        error: function (error) {
            toastr.error(error.responseJSON.message).delay(2000).fadeOut(1000);
        }
    });

});

socket.on("newmessage", (data) => {

    // if chat is not open of messanger user
    if ($('#user-list li.selected').data("id") != data.id) {
        toastr.info(`New message from ${data.name}`).delay(2000).fadeOut(1000);
    }
});