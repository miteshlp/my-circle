$(document).ready(function () {

    $(document).on('click', '.save-post', function () {
        const id = $(this).data('id');
        const  element = $(this);
        $.ajax({
            type: "post",
            url: `/posts/unsave`,
            data: {id : id},
            success: function (response) {
                if (response.type == "error") {
                    alert(`error message : ${response.messaage}`);
                }
                else {
                    element.closest("div.col-sm-6").remove();
                    toastr.success('Post unsaved !').delay(1000).fadeOut(1000);
                }
            },
            error: function (error) {
                alert(`ERROR => ${error}`);
            }
        });
    });
})