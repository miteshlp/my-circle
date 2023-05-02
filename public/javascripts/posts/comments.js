$(document).ready(function () {


    $(document).on('click', '#add', function () {
        const postId = $(this).data('id');
        const comment = $("#comment").val().concat(" ").trim();
        if (!comment) {
            return toastr.error("Can not add empty comment !").delay(1500).fadeOut(1000);
        }
        console.log(postId, comment);
        $.ajax({
            type: "post",
            url: `/posts/${postId}/comments`,
            data: {
                comment: comment
            },
            success: function (response) {
                toastr.success("comment added !").delay(1500).fadeOut(1000);
                $("#edit-loader").html(response);
            },
            error: function (error) {
                console.log(error);
                toastr.error(error.responseJSON.message).delay(1500).fadeOut(1000);
            }
        });
    });

    $(document).on('click', '.delete', function () {
        const id = $(this).data('id');
        const postId = $(this).data('postid');
        const element = $(this).closest('div[class^="specific_comment"]');
        $.ajax({
            type: "delete",
            url: `/posts/${postId}/comments/${id}`,
            data: {},
            success: function (response) {
                toastr.success(response.message).delay(1500).fadeOut(1000);
                element.remove();
            },
            error: function (error) {
                console.log(error);
                toastr.error(error.responseJSON.message).delay(1500).fadeOut(1000);
            }
        });
    });
})