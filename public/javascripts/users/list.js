function getValue(page) {
    let match = $("#searchUser").val().concat(" ").trim();
    if (match.length == 0) match = "empty";
    filterdata(page, match);
}

$(document).ready(function () {


    $(document).on('keyup', '#searchUser', function () {
        let match = $(this).val().concat(" ").trim();
        if (match.length == 0) match = "empty";
        filterdata(1, match);
    });

    window.filterdata = function (page, match) {
        $.ajax({
            type: "get",
            url: `/users?page=${page}&search=${match}`,
            data: {},
            success: function (response) {
                if (response.type == "error") {
                    alert(`error message : ${response.messaage}`);
                }
                else {
                    $('.page-body').html(response);
                }
            },
            error: function (error) {
                alert(`ERROR => ${error}`);
            }
        });
    }
})