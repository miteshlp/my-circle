function getValue(page) {
    const sort = $('#sort').text();
    let match = $("#searchPost").val().concat(" ").trim();
    if (match.length == 0) match = "empty";
    filterdata(page, sort, match);
}
$(document).ready(function () {

    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    $('.dropdown-menu a').click(function () {
        $(this).parent().parent().prev().text($(this).text());
        getValue(1);
    });

    $(document).on('keyup', '#searchPost',(debounce (function () {
        getValue(1);
    },500)));

    window.filterdata = function(page, sort, match) {
        $.ajax({
            type: "get",
            url: `/?page=${page}&sort=${sort}&search=${match}`,
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

    $(document).on('click', '.view', function () {
        const id = $(this).data('id');
        $.ajax({
            type: "get",
            url: `/view/${id}`,
            data: {},
            success: function (response) {
                if (response.type == "error") {
                    alert(`error message : ${response.messaage}`);
                }
                else {
                    $("#view-loader").html(response);
                }
            },
            error: function (error) {
                alert(`ERROR => ${error}`);
            }
        });
    });

    $(document).on('click', '.save-post', function () {
        window.location.href = "http://127.0.0.1:3000/sign-in";        
    });
})