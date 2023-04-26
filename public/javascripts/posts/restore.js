$(document).ready(function () {

    $(document).on('click', '#restore', function () {
        const id = $(this).data('id');
        console.log("restore");
        $.ajax({
            type: "put",
            url: `/posts/restore`,
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