$(document).ready(function () {

    $(document).on('click', '#restore', function () {
        const id = $(this).data('id');
        const element = $(this);
        $.ajax({
            type: "put",
            url: `/posts/restore`,
            data: {id : id},
            success: function (response) {
                if (response.type == "error") {
                    alert(`error message : ${response.messaage}`);
                }
                else {
                    element.closest("div.col-sm-6").remove();
                }
            },
            error: function (error) {
                alert(`ERROR => ${error}`);
            }
        });
    });
})