$(document).ready(function () {


    $(document).on('click', '.confirm', function () {
        const requestId = $(this).data('id');
        const element = $(this);
        console.log(requestId);
        $.ajax({
            type: "put",
            url: `/users/followers/requests/${requestId}/${true}`,
            success: function (response) {
                toastr.success(response.message).delay(1500).fadeOut(1000);
                element.parent().html(`<div class="p-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon text-green" width="24"
                    height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                    fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M5 12l5 5l10 -10"></path>
                </svg>
                Request accepted.
            </div>`);
            },
            error: function (error) {
                toastr.error(error.responseJSON.message).delay(1500).fadeOut(1000);
                element.parent().html(`<div class="p-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon text-red" width="24" height="24"
                viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" 
                stroke-linecap="round"stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M18 6l-12 12"></path><path d="M6 6l12 12"></path></svg>
                Request rejected.
            </div>`);
            }
        });
    });

    $(document).on('click', '.reject', function () {
        const requestId = $(this).data('id');
        console.log(requestId);
        $.ajax({
            type: "put",
            url: `/users/followers/requests/${requestId}/${false}`,
            success: function (response) {
                toastr.success(response.message).delay(1500).fadeOut(1000);
                // element.remove();
            },
            error: function (error) {
                console.log(error);
                toastr.error(error.responseJSON.message).delay(1500).fadeOut(1000);
            }
        });
    });
})