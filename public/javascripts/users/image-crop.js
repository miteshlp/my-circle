var previewImage = document.getElementById('previewImage');
var croppedImage = document.getElementById('croppedImage');
var fileInput = document.getElementById('fileInput');
var cropper;

fileInput.addEventListener('change', function (evt) {

    $("#crop-image-done").prop("disabled", false)
    var file = evt.currentTarget.files[0];
    var reader = new FileReader();

    reader.onload = function (evt) {
        previewImage.onload = function () {
            if (cropper) {
                cropper.destroy();
            }
            cropper = new Cropper(previewImage, {
                aspectRatio: 1,
                viewMode: 1,
                zoomable: false,
                checkCrossOrigin: false,
                crop: function (event) {
                    var croppedCanvas = cropper.getCroppedCanvas();
                    croppedImage.src = croppedCanvas.toDataURL('image/jpeg', 1.0);
                }
            });
        };
        previewImage.src = evt.target.result;
    };

    reader.readAsDataURL(file);
});