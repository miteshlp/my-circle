$(document).ready(function () {

    let croppedImage;

    $('#account_privacy a').click(function () {
        $(this).parent().parent().prev().text($(this).text());
    });

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
            data.append("account_privacy", $("#privacy").text());
            const isChanged = $("#imagePreviewContainer").attr("data-ischanged");
            if (isChanged == "true") {

                // Get the base64 data from the image's src attribute
                const base64Data = croppedImage.src.split(',')[1];

                // Convert the base64 data to a Blob
                const byteCharacters = atob(base64Data);
                const byteArrays = [];

                for (let i = 0; i < byteCharacters.length; i++) {
                    byteArrays.push(byteCharacters.charCodeAt(i));
                }
                const blob = new Blob([new Uint8Array(byteArrays)], { type: 'image/jpeg' });

                // Create a FormData object and append the blob
                data.append('aavtar', blob, 'image.jpg');
            }
            $("form").serialize()
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

    $("#edit-profile-image").on("click", function () {
        $("#image-crop-modal").modal("show");
    });

    $("#crop-image-done").on("click", function () {
        const imagePreviewContainer = document.getElementById("imagePreviewContainer");
        $("#image-crop-modal").modal("hide");
        const myImage = document.getElementById('croppedImage');
        croppedImage = myImage;
        const canvas = document.createElement('canvas');
        canvas.width = myImage.naturalWidth;
        canvas.height = myImage.naturalHeight;

        // Get the 2D context of the canvas
        const context = canvas.getContext('2d');

        // Draw the image onto the canvas
        context.drawImage(myImage, 0, 0);

        // Convert the imageData to a data URL
        const dataUrl = canvas.toDataURL('image/png'); // You can choose the appropriate image format

        // Set the background image using the data URL
        imagePreviewContainer.style.backgroundImage = `url(${dataUrl})`;
        $("#imagePreviewContainer").attr("data-ischanged", "true");
    });
})