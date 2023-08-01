$(document).ready(function () {

    $("#description").on("keyup" ,function () {
        var value = $(this).val()?.trim().length;
        $("#descriptionCount").text(value);
    })

    $("#title").on("keyup" ,function () {
        var value = $(this).val()?.trim().length;
        $("#titleCount").text(value);
    })

    
    $("#createPostForm").validate({
        rules: {
            aavtar: "required",
            title: {
                required: true,
                maxlength: 30
            },
            description: {
                maxlength: 300
            },
        },
        submitHandler: function (form) {
            const data = new FormData(form);
            $("form").serialize()
            $.ajax({
                method: "POST",
                url: `/posts/create`,
                data: data,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                success: function (response) {
                    toastr.success(response.message).delay(1500).fadeOut(1000);
                    setTimeout(() => {
                        window.location.href = "/posts";
                    }, 1500);
                },
                error: function (error) {
                    toastr.error(error.responseJSON.message).delay(1500).fadeOut(1000);
                }
            })
        }
    });
})
