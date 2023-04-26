$(document).ready(function () {

    $("form").submit(function (e) {
        e.preventDefault();
    }).validate({
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
            form.submit();
        }
    });
})