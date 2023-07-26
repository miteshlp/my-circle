function getValue(page) {
    const filter = $('#filter').text();
    const sort = $('#sort').text();
    let match = $("#searchPost").val().concat(" ").trim();
    if (match.length == 0) match = "empty";
    filterdata(page, filter, sort, match);
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

    $('.filterize a').click(function () {
        $(this).parent().parent().prev().text($(this).text());
        getValue();
    });

    $(document).on('keyup', '#searchPost', (debounce(function () {
        getValue();
    }, 500)));

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
                toastr.error(error.responseJSON.message).delay(2000).fadeOut(1000);
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
                toastr.error(error.responseJSON.message).delay(2000).fadeOut(1000);
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
                $("#edit-loader").html(response);
            },
            error: function (error) {
                toastr.error(error.responseJSON.message).delay(2000).fadeOut(1000);
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
                if (response.status == 201) {
                    element.html(`<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24"
                    width="24">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                </svg>`);
                    element.attr("title", "Unsave")
                    toastr.success(response.message).delay(1000).fadeOut(1000);
                }
                else {
                    element.html(`<svg xmlns="http://www.w3.org/2000/svg"
                    class="icon icon-tabler icon-tabler-bookmark" width="24" height="24"
                    viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M9 4h6a2 2 0 0 1 2 2v14l-5 -3l-5 3v-14a2 2 0 0 1 2 -2"></path>
                </svg>`);
                    element.attr("title", "Save")
                };
            },
            error: function (error) {
                toastr.error(error.responseJSON.message).delay(2000).fadeOut(1000);
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
                    toastr.success(response.message).delay(1000).fadeOut(1000);
                }
            },
            error: function (error) {
                toastr.error(error.responseJSON.message).delay(1500).fadeOut(1000);
            }
        });
    });

    $(document).on('click', '.like-post', function () {
        const postId = $(this).data('id');
        const element = $(this);
        totalLikes = $(this).prev().children("span");
        $.ajax({
            type: "post",
            url: `/posts/${postId}/likes`,
            data: {},
            success: function (response) {
                if (response.status == 201) {
                    element.html(`<svg xmlns="http://www.w3.org/2000/svg"
                    class="icon icon-filled text-red lg:mr-2 icon-tabler icon-tabler-heart"
                    width="24" height="24" viewBox="0 0 24 24" stroke-width="2"
                    stroke="currentColor" fill="none" stroke-linecap="round"
                    stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path
                        d="M19.5 12.572l-7.5 7.428-7.5-7.428a5 5 0 1 1 7.5-6.566 5 5 0 1 1 7.5 6.572">
                    </path>
                </svg>`)
                    totalLikes.text(parseInt(totalLikes.text()) + 1);
                    element.attr("title", "Unlike");
                    toastr.success(response.message).delay(1000).fadeOut(1000);
                }
                else {
                    element.html(`<svg xmlns="http://www.w3.org/2000/svg" class="icon text-pink" width="24"
                    height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                    fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path
                        d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572">
                    </path>
                </svg>`)
                    totalLikes.text(parseInt(totalLikes.text()) - 1);
                    element.attr("title", "Like")
                }

            },
            error: function (error) {
                toastr.error(error.responseJSON.message).delay(1500).fadeOut(1000);
            }
        });
    });

    $(document).on('click', '.likedBy', function () {
        const postId = $(this).data('id');
        const element = $(this);
        $.ajax({
            type: "get",
            url: `/posts/${postId}/likes`,
            data: {},
            success: function (response) {
                element.find(".liked_menu").html(response);
                if (element.find("span").text() != "0") {
                    element.find(".liked_menu").toggle();
                }
            },
            error: function (error) {
                toastr.error(error.responseJSON.message).delay(1500).fadeOut(1000);
            }
        });
    });

    $(document).on('click', '.comment-btn', function () {
        const id = $(this).data('id');
        const element = $(this);
        $.ajax({
            type: "get",
            url: `/posts/${id}/comments`,
            data: {},
            success: function (response) {
                $("#edit-loader").html(response);
            },
            error: function (error) {
                toastr.error(error.responseJSON.message).delay(1500).fadeOut(1000);
            }
        });
    });

    $(document).click(function () {
        $(".liked_menu").hide();
    });
})