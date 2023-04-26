$(document).ready(function () {

    // $(document).on('keyup', 'input[name=email]', function () {
    //     const mail = $("input[name=email]").val();
    //     $.ajax({
    //         method: "get",
    //         url: `/email-validation/${mail}`,
    //         data: {},
    //         success: function (response) {
    //             if (response.type == "error") {
    //                 $("input[name=email]").after('<div id=taken>Email already used !</div>');
    //             }
    //             else {
    //                 $("#taken").remove();
    //             }
    //         },
    //         error: function (error) {
    //             alert(`ERROR => ${error}`);
    //         }
    //     })
    // });

    jQuery.validator.addMethod("noSpace", function (value, element) {
        return value.indexOf(" ") < 0 && value != "";
    }, "No space please and don't leave it empty");

    $.validator.addMethod("pwcheck", function (value) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%&])(.{4,20}$)/.test(value);
    });

    $.validator.addMethod("emailCheck", function (value) {
        return /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i.test(value);
    },'not a valid e-mail address');

    $("form").submit(function (e) {
        e.preventDefault();
    }).validate({
        rules: {
            firstName: {
                required: true,
                noSpace: true
            },
            lastName: {
                required: true,
                noSpace: true
            },
            email: {
                required: true,
                emailCheck : true,
                noSpace: true,
                // remote: {
                //     url:  `/email-validation/${mail}`,
                //     type: "post",
                //   }
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
                noSpace: true,
                equalTo: "#pass-word"
            }
        },
        messages: {
            password: {
                pwcheck: "Password must contain atleast 1 lowercase, 1 uppercase and 1 digit",
            },
            email:{
                remote : "Email is already registered"
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