$(document).ready(function () {
    $("#editPostForm").validate({
        rules: {
            title: "required",
        },
        submitHandler: function (form) {
            const data = new FormData(form);
            const id = $("#save").data('id')
            data.append("id", id);
            console.log($("form").serialize())
            $.ajax({
                method: "PUT",
                url: `/posts/edit`,
                data: data,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                success: function (response) {
                    toastr.success(response.message).delay(1000).fadeOut(1000);
                    $("#edit-modal").modal("toggle");
                    setTimeout(() => {
                        getValue($(".active").text());
                    }, 500);
                },
                error: function (error) {
                    toastr.error(error.responseJSON.message).delay(1500).fadeOut(1000);
                }
            })
        }
    });
})