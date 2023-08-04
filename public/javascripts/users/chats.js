$(document).ready(function () {

    $("#userNavbar").removeClass("bg-white");

    socket.on("call-disconnect", () => {
        // audio.pause();
        $("#P2P-video-call").removeAttr("data-roomid");
        $("#P2P-video-call").removeClass("text-success");
        $("#video-call-modal").modal('hide');
        $("#video-call-loader").html("");
        toastr.success("Video call ended !").delay(2000).fadeOut(1000);
    });

    socket.on("call-rejected", () => {
        $("#P2P-video-call").removeClass("text-success");
        $("#video-call-loader").html("");
        $("#video-call-modal").modal('hide');
        toastr.error("Video call rejected !").delay(2000).fadeOut(1000);
    })

    socket.on("newmessage", (data) => {

        // add or update badge and unseen count and time for new message  
        let element = $(`*[data-id=${data.id}] p.lastMessageTime`);
        element.text("Just now");
        element = $(`*[data-id=${data.id}] p.lastMessage`);
        if (data.message.length > 30) {
            let str1 = data.message.slice(0, 30).concat(" ...");
            let str2 = str1.charAt(0).toUpperCase() + str1.slice(1);
            element.text(str2);
        } else {
            element.text(data.message.charAt(0).toUpperCase() + data.message.slice(1));
        }
        if ($('#user-list li.selected').data("id") != data.id) {
            element = $(`*[data-id=${data.id}] span`);
            element.text(parseInt(element.text().length ? element.text() : 0) + 1);
            element.addClass("badge bg-danger");
        }

        // Move user at top when new message come
        const appendLi = $(`li[data-id=${data.id}]`);
        const html = appendLi;
        appendLi.remove();
        $("#user-list").prepend(html)

        // append new message in chat if chat is open of that user
        if ($('#user-list li.selected').data("id") == data.id) {
            $(".scroll-chat").append(`<li class="d-flex justify-content-between mb-2 w-75">
            <img src=${data.path} alt="avatar"
            class="rounded-circle me-3 shadow-1-strong" width="60" height="60">
            <div class="card mask-custom w-100">
            <div class="card-header d-flex justify-content-between pt-2 pb-2"
            style="border-bottom: 1px solid rgba(255,255,255,.3);">
            <p class="fw-bold mb-0">${data.name}</p>
            <p class="text-light small mb-0"><i class="far fa-clock"></i> Just now</p>
            </div>
            <div class="card-body pt-2 pb-2">
            <p class="mb-0">${marked(data.message)}</p>
            </div>
            </div>
            </li>`);
            // scoll down when new message come
            const nestedElement = $(".scroll-chat");
            nestedElement.scrollTop(nestedElement[0]?.scrollHeight);
        }

    });

    $(document).on('click', '.chat-user', function () {
        const userId = $(this).data('id');
        $('#user-list li.selected').removeClass('selected');
        $(this).addClass("selected");
        let element = $(`*[data-id=${userId}] span`);
        element.text("");
        element.removeClass("badge bg-danger");
        $.ajax({
            type: "get",
            url: `/users/get-user-chat/${userId}`,
            success: function (response) {
                $("#chat-container").html(response);
                const nestedElement = $(".scroll-chat");
                nestedElement.scrollTop(nestedElement[0]?.scrollHeight);
            },
            error: function (error) {
                console.log(`error.responseJSON.message :>> `, error.responseJSON.message);
            }
        });
    });

    $(document).on('keyup', '#chat-message-box', function (event) {
        if (event.keyCode === 13) { // 13 represents the Enter key
            event.preventDefault();
            $("#sendMessage").click(); // Trigger the button click event
        }

    });

    $(document).on('click', '#sendMessage', function () {
        let message = $("#chat-message-box").val();
        message = message?.trim();
        if (message.length) {
            const receiverId = $(this).data('id');
            $.ajax({
                type: "post",
                url: `/users/chats/message`,
                data: { message: message, receiverId: receiverId },
                success: function (response) {
                    $(".scroll-chat").append(`<div class="d-flex justify-content-end"><li class="d-flex justify-content-between mb-2 w-75">
                        <div class="card mask-custom w-100">
                        <div class="card-header d-flex justify-content-between pt-2 pb-2"
                        style="border-bottom: 1px solid rgba(255,255,255,.3);">
                        <p class="fw-bold mb-0">${response.data.name}</p>
                        <p class="text-light small mb-0"><i class="far fa-clock"></i> Just now</p>
                        </div>
                        <div class="card-body pt-2 pb-2">
                        <p class="mb-0">${marked(response.data.message)}</p>
                        </div>
                        </div>
                        <img src=${response.data.path} alt="avatar" class="rounded-circle ms-3 shadow-1-strong"
                        width="60" height="60">
                            </li></div>`)
                    $("#chat-message-box").val('');
                    const nestedElement = $(".scroll-chat");
                    nestedElement.scrollTop(nestedElement[0]?.scrollHeight);
                },
                error: function (error) {
                    console.log(`error.responseJSON.message :>> `, error.responseJSON.message);
                }
            });
        }
    });
})