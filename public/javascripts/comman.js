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

$("#day-night-toggle").on("click" ,function () {
    $("body").toggleClass("theme-dark");
    if ($("body").hasClass("theme-dark")) {
        localStorage.setItem("theme-mode", "theme-dark");
    } else {
        localStorage.setItem("theme-mode", "");
    }
})