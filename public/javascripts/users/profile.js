$(document).ready(function () {

    $('#account_privacy a').click(function () {
        $(this).parent().parent().prev().text($(this).text());
    });

    $.validator.addMethod("pwcheck", function (value) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%&])(.{4,20}$)/.test(value);
    });

    const imageInput = document.getElementById("formFile");
    const imagePreviewContainer = document.getElementById("imagePreviewContainer");

    // Function to handle image selection and show preview
    imageInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreviewContainer.style.backgroundImage = `url(${e.target.result})`;
            };
            reader.readAsDataURL(file);
        }
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
            data.append("account_privacy", $("#privacy").text());
            console.log($("form").serialize())
            console.log(data);
            $.ajax({
                method: "PUT",
                url: "/users/profile",
                data: data,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                success: function (response) {
                    toastr.success('Profile updated successfully !').delay(1500).fadeOut(1000);
                    setTimeout(() => {
                        window.location.href = "/users/profile"
                    }, 1500);
                },
                error: function (error) {
                    toastr.error(error.responseJSON.message).delay(1500).fadeOut(1000);
                }
            })
        }
    });
})