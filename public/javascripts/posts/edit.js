$(document).ready(function () {
    $("#editPostForm").validate({
        rules: {
            title: "required",
        },
        submitHandler: function (form) {
            const data = new FormData(form);
            const id = $("#save").data('id')
            data.append("id",id);
            console.log($("form").serialize())
            $.ajax({
                method: "PUT",
                url: `/posts/edit`,
                data: data,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                success: function (response) {
                    if (response.type == "error") {
                        alert(`error message : ${response}`);
                    }
                    else {
                        window.location.href = "/posts"
                    }
                },
                error: function (error) {
                    alert(`ERROR => ${error}`);
                }
            })
        }
    });
})