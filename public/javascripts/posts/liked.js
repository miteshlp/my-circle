$(document).ready(function () {

    $(document).on('click', '.like-post', function () {
        const id = $(this).data('id');
        const element = $(this);
        $.ajax({
            type: "post",
            url: `/posts/likes`,
            data: { post: id },
            success: function (response) {
                element.closest("div.col-sm-6").remove();
                toastr.success(response.message).delay(1000).fadeOut(1000);
            },
            error: function (error) {
                toastr.error(error.responseJSON.message).delay(2000).fadeOut(1000);
            }
        });
    });
})