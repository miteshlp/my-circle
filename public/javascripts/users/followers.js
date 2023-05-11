$(document).ready(function () {

    $(document).on('click', '.follow', function () {
        const userId = $(this).data('id');
        const element = $(this);
        console.log(userId);
        $.ajax({
            type: "post",
            url: `/users/${userId}/followers/requested`,
            success: function (response) {
                if (response.status == "201") {
                    element.text("Following");
                }
                else {
                    element.text("Requested");
                }
                element.addClass("disabled");
                toastr.success(response.message).delay(1500).fadeOut(1000);
            },
            error: function (error) {
                toastr.error(error.responseJSON.message).delay(1500).fadeOut(1000);
            }
        });
    });

    $(document).on('click', '.remove', function () {
        const requestId = $(this).data('id');
        const element = $(this);
        $.ajax({
            type: "put",
            url: `/users/followers/requests/${requestId}/${false}`,
            success: function (response) {
                toastr.success("User removed successfully !").delay(1500).fadeOut(1000);
                let text = element.text();
                console.log(text.indexOf("e"), text);
                if (text.indexOf("e") != 1) {
                    element.parent().html(`<div class="p-2">User ${text + "ed."}</div>`);
                }
                else {
                    element.parent().html(`<div class="p-2">User ${text + "d."}</div>`);
                }
            },
            error: function (error) {
                toastr.error(error.responseJSON.message).delay(1500).fadeOut(1000);
            }
        });
    });
})