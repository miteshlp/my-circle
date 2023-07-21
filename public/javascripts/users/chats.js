$(document).ready(function () {

    socket.on("newmessage", (data) => {
        console.log(`data from ai :>> `, data);
        $(".scroll-chat").append(`<li class="d-flex justify-content-between mb-2 w-75">
        <img src=${data.path} alt="avatar"
            class="rounded-circle d-flex align-self-start me-3 shadow-1-strong" width="60" height="60">
        <div class="card mask-custom w-100">
            <div class="card-header d-flex justify-content-between pt-2 pb-2"
                style="border-bottom: 1px solid rgba(255,255,255,.3);">
                <p class="fw-bold mb-0">${data.name}</p>
                <p class="text-light small mb-0"><i class="far fa-clock"></i> Just now</p>
            </div>
            <div class="card-body pt-2 pb-2">
                <p class="mb-0">${data.message}</p>
            </div>
        </div>
    </li>`);
        const nestedElement = $(".scroll-chat");
        nestedElement.scrollTop(nestedElement[0].scrollHeight);
    });

    $(document).on('click', '.chat-user', function () {
        const userId = $(this).data('id');
        $.ajax({
            type: "get",
            url: `/users/get-user-chat/${userId}`,
            success: function (response) {
                $("#chat-container").html(response);
                const nestedElement = $(".scroll-chat");
                nestedElement.scrollTop(nestedElement[0].scrollHeight);
            },
            error: function (error) {
                console.log(`error.responseJSON.message :>> `, error.responseJSON.message);
            }
        });
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
                        <p class="mb-0">${response.data.message}</p>
                        </div>
                        </div>
                        <img src=${response.data.path} alt="avatar" class="rounded-circle d-flex align-self-start ms-3 shadow-1-strong"
                        width="60" height="60">
                            </li></div>`)
                    $("#chat-message-box").val('');
                    const nestedElement = $(".scroll-chat");
                    nestedElement.scrollTop(nestedElement[0].scrollHeight);
                },
                error: function (error) {
                    console.log(`error.responseJSON.message :>> `, error.responseJSON.message);
                }
            });
        }
    });

})