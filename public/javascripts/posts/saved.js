$(document).ready(function () {

    $(document).on('click', '.save-post', function () {
        const id = $(this).data('id');
        $.ajax({
            type: "post",
            url: `/posts/unsave`,
            data: {id : id},
            success: function (response) {
                if (response.type == "error") {
                    alert(`error message : ${response.messaage}`);
                }
                else {
                    location.reload();
                }
            },
            error: function (error) {
                alert(`ERROR => ${error}`);
            }
        });
    });
})