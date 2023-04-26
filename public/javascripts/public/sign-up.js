$(document).ready(function () {

    jQuery.validator.addMethod("noSpace", function (value, element) {
        return value.indexOf(" ") < 0 && value != "";
    }, "No space please and don't leave it empty");

    $.validator.addMethod("pwcheck", function (value) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%&])(.{4,20}$)/.test(value);
    });

    $("form").submit(function (e) {
        e.preventDefault();
    }).validate({
        rules: {
            firstName: {
                required: {
                    depends: function () {
                        $(this).val($.trim($(this).val()));
                        return true;
                    }
                },
            },
            lastName: {
                required: {
                    depends: function () {
                        $(this).val($.trim($(this).val()));
                        return true;
                    }
                },
            },
            email: {
                required: true,
                email: true,
                remote: {
                    url:  `/email-validation`,
                },
            },
            gender: {
                required: true,

            },
            password: {
                minlength: 3,
                noSpace: true,
                pwcheck: true
            },
            confirm: {
                minlength: 3,
                equalTo: "#pass-word"
            }
        },
        messages: {
            password: {
                pwcheck: "Password must contain atleast 1 lowercase, 1 uppercase and 1 digit",
            },
            email: {
                remote: "Email is already registered"
            }
        },
        errorPlacement: function (error, element) {
            if (element.attr("type") == "radio") {
                error.insertAfter($(element).parent());
            }
            else {
                element.after(error);
            }
        },
        submitHandler: function (form) {
            form.submit();
        }
    });
})