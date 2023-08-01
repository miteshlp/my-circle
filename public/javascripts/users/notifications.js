$(document).ready(function () {

    $(document).on('click', '.specificNotification', function () {
        const postId = $(this).data('postid');
        let url;
        if (!postId) {
            const profileId = $(this).data('senderid');
            return getUserProfile(profileId);
        }
        else {
            $(this).removeClass("unSeen");
            $.ajax({
                type: "get",
                url: `/posts/view/${postId}`,
                data: {},
                success: function (response) {
                    $("#view-loader").html(response);
                    getNotifyCount();
                },
                error: function (error) {
                    toastr.error(error.responseJSON.message).delay(2000).fadeOut(1000);
                }
            });
        }
    });
})