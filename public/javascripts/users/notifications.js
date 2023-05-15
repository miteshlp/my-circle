$(document).ready(function () {

    console.log("document ready");

    $(document).on('click', '.specificNotification', function () {
        const postId = $(this).data('postid');
        let url;
        if (!postId) {
            const profileId = $(this).data('notifyid');
            return window.location.href = `/users/profile/${profileId}`
            // url = `/users/profile/${profileId}`;
        }
        else {
            console.log("from herrer", postId);
            $(this).removeClass("unSeen");
            $.ajax({
                type: "get",
                url: `/posts/view/${postId}`,
                data: {},
                success: function (response) {
                    if (!postId) {
                        $('.page-body').html(response);
                        // getNotifyCount();
                    }
                    else {
                        $("#view-loader").html(response);
                        getNotifyCount();
                    }
                },
                error: function (error) {
                    toastr.error(error.responseJSON.message).delay(2000).fadeOut(1000);
                }
            });
        }
    });
})