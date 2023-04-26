$(document).ready(function () {

    $.validator.addMethod("pwcheck", function (value) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%&])(.{4,20}$)/.test(value);
    });

    $("#editUserForm").validate({
        rules: {
            firstName: {
                required: true,
            },
            lastName: {
                required: true,
            },
        },
        submitHandler: function (form) {
            const data = new FormData(form);
            console.log($("form").serialize())
            $.ajax({
                method: "PUT",
                url: "/users/profile",
                data: data,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                success: function (response) {
                    if (response.type == "error") {
                        console.log(response);
                    }
                    else {
                        window.location.href = "/users/profile"
                    }
                },
                error: function (error) {
                    alert(`ERROR => ${error}`);
                }
            })
        }
    });
})