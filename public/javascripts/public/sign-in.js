$(document).ready(function () {
    $("form").validate({
        rules: {
            email: "required",
            password: "required"
        },
    });
})