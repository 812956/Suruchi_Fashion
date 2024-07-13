let cropper;
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const cropperModal = document.getElementById('cropperModal');
const cropperImage = document.getElementById('cropperImage');
const cropButton = document.getElementById('cropButton');
const closeModalButton = document.getElementsByClassName('close')[0];

let currentFileIndex = 0;
let filesToProcess = [];
let processedFiles = [];

const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;


imageUpload.addEventListener('change', function(event) {

  
    if(!allowedExtensions.exec(event.target.files[0].name)){
        showError('image-error', 'please upload an image')
        return
    }
    else{
        hideError('image-error')
    }

    const files = event.target.files;
    if (files.length > 0) {
        filesToProcess = Array.from(files);
        currentFileIndex = 0;
        processNextFile();
    }
});

function processNextFile() {
    if (currentFileIndex < filesToProcess.length) {
        const file = filesToProcess[currentFileIndex];
        const reader = new FileReader();
        reader.onload = function(e) {
            cropperImage.src = e.target.result;
            cropperModal.style.display = 'block';
            cropper = new Cropper(cropperImage, {
                viewMode: 1,
                background: false,
                cropBoxResizable: false,
                ready: function() {
                    this.cropper.setCropBoxData({
                        width: 282,
                        height: 310
                    });
                }
            });
        };
        reader.readAsDataURL(file);
    }
}

cropButton.addEventListener('click', function(event) {
    
    event.preventDefault()

    cropper.getCroppedCanvas({
        width: 282,
        height: 310
    }).toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const imageBox = document.createElement('div');
        imageBox.classList.add('image-box');

        const img = document.createElement('img');
        img.src = url;
        img.alt = filesToProcess[currentFileIndex].name;

        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-image');
        removeButton.innerHTML = '&times;';
        removeButton.onclick = function() {
            imagePreview.removeChild(imageBox);
            // Remove from processedFiles array
            processedFiles = processedFiles.filter(file => file.url !== url);
        };

        imageBox.appendChild(img);
        imageBox.appendChild(removeButton);
        imagePreview.appendChild(imageBox);

        processedFiles.push({ name: filesToProcess[currentFileIndex].name, blob: blob, url: url });
        cropperModal.style.display = 'none';
        cropper.destroy();

        currentFileIndex++;
        processNextFile();

        console.log(processedFiles)
    });
});

closeModalButton.addEventListener('click', function() {
    cropperModal.style.display = 'none';
    cropper.destroy();

    imagePreview.innerHTML = ''; // Clear the image preview
    
});

window.onclick = function(event) {
    if (event.target === cropperModal) {
        cropperModal.style.display = 'none';
        cropper.destroy();
    }
};

function getProcessedFiles() {
    return processedFiles.map(file => file.blob);
}


    // Function to get the processed files array
    function getProcessedFiles() {
        return processedFiles;
    }



    // Function to show error message
    function showError(elementId, message) {
    document.getElementById(elementId).innerText = message;
    document.getElementById(elementId).classList.add('text-danger');
    }

    // Function to hide error message
    function hideError(elementId) {
        document.getElementById(elementId).innerText = '';
        document.getElementById(elementId).classList.remove('text-danger');
    }