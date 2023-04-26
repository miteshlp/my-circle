$(document).ready(function () {

    jQuery.validator.addMethod("noSpace", function (value, element) {
        return value.indexOf(" ") < 0 && value != "";
    }, "No space please and don't leave it empty");

    $("form").submit(function (e) {
        e.preventDefault();
    }).validate({
        rules: {
            aavtar: "required",
            title: {
                required: true,
                noSpace: true,
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