function getValue(page) {
    const filter = $('#filter').text();
    const sort = $('#sort').text();
    let match = $("#searchPost").val().concat(" ").trim();
    if (match.length == 0) match = "empty";
    filterdata(page, filter, sort, match);
}

$(document).ready(function () {

    // function delay(callback, ms) {
    //     var timer = 0;
    //     return function() {
    //       var context = this, args = arguments;
    //       clearTimeout(timer);
    //       timer = setTimeout(function () {
    //         callback.apply(context, args);
    //       }, ms || 0);
    //     };
    //   }

    // function getValue(page = 1) {
    //     const filter = $('#filter').text();
    //     const sort = $('#sort').text();
    //     let match = $("#searchPost").val().concat(" ").trim();
    //     if (match.length == 0) match = "empty";
    //     filterdata(page, filter, sort, match);
    // }

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
        getValue();
    });

    $(document).on('keyup', '#searchPost',(debounce(function () {
        getValue();
    },500)));

    window.filterdata = function (page, filter, sort, match) {
        $.ajax({
            type: "get",
            url: `/posts?page=${page}&filter=${filter}&sort=${sort}&search=${match}`,
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
            url: `/posts/view/${id}`,
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

    $(document).on('click', '.edit', function () {
        const id = $(this).data('id');
        $.ajax({
            type: "get",
            url: `/posts/edit/${id}`,
            data: {},
            success: function (response) {
                if (response.type == "error") {
                    alert(`error message : ${response.messaage}`);
                }
                else {
                    $("#edit-loader").html(response);
                }
            },
            error: function (error) {
                alert(`ERROR => ${error}`);
            }
        });
    });

    $(document).on('click', '.save-post', function () {
        const id = $(this).data('id');
        const element = $(this);
        $.ajax({
            type: "post",
            url: `/posts/save`,
            data: { post: id },
            success: function (response) {
                if (response.type == "saved") {
                    element.html(`<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24"
                    width="24">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                </svg>`);
                toastr.success('Post saved !').delay(1000).fadeOut(1000);
                }
                else {
                    element.html(`<svg xmlns="http://www.w3.org/2000/svg"
                    class="icon icon-tabler icon-tabler-bookmark" width="24" height="24"
                    viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M9 4h6a2 2 0 0 1 2 2v14l-5 -3l-5 3v-14a2 2 0 0 1 2 -2"></path>
                </svg>`);
                toastr.success('Post unsaved !').delay(1000).fadeOut(1000);
                };
            },
            error: function (error) {
                alert(`ERROR => ${error}`);
            }
        });
    });

    $(document).on('click', '.archive', function () {
        const id = $(this).data('id');
        const element = $(this);
        $.ajax({
            type: "post",
            url: `/posts/archive`,
            data: { post: id },
            success: function (response) {
                if (response.type == "error") {
                    alert(`error message : ${response.messaage}`);
                }
                else {
                    getValue($(".active").text());
                    toastr.success('Post archived successfully !').delay(1000).fadeOut(1000);
                }
            },
            error: function (error) {
                alert(`ERROR => ${error}`);
            }
        });
    });



})