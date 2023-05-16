function getUserProfile(userId) {
    console.log("in comman");
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