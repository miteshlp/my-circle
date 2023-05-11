$(document).ready(function () {

    $(document).on('click', '.specificNotification', function () {
        const postId = $(this).data('postid');
        if(!postId){
            console.log("in this");
            window.location.href = "/users/followers/requests";
        }
        console.log("from herrer",postId);
        $(this).removeClass("unSeen");
        $.ajax({
            type: "get",
            url: `/posts/view/${postId}`,
            data: {},
            success: function (response) {
                $("#view-loader").html(response);
            },
            error: function (error) {
                toastr.error(error.responseJSON.message).delay(2000).fadeOut(1000);
            }
        });
    });
})