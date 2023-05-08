function getValue(page) {
    let match = $("#searchUser").val().concat(" ").trim();
    if (match.length == 0) match = "empty";
    filterdata(page, match);
}

$(document).ready(function () {

    function debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    $(document).on('keyup', '#searchUser', (debounce(function () {
        let match = $(this).val().concat(" ").trim();
        if (match.length == 0) match = "empty";
        filterdata(1, match);
    }, 500)));

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

    $(document).on('click', '.follow', function () {
        const userId = $(this).data('id');
        const element = $(this);
        $.ajax({
            type: "post",
            url: `/users/${userId}/followers/requested`,
            data: {},
            success: function (response) {
                if (response.status == "201") {
                    element.text("Following");
                }
                else {
                    element.text("Requested");
                }
                element.removeClass("bg-info-lt follow");
                element.addClass("bg-success-lt")
                toastr.success(response.message).delay(2000).fadeOut(1000);
            },
            error: function (error) {
                toastr.error(error.responseJSON.message).delay(2000).fadeOut(1000);
            }
        });
    });
})