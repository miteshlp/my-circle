$(document).ready(function () {
    console.log("loaded");
    $("form").validate({
        rules: {
            email: "required",
            password: "required"
        },
    });
})