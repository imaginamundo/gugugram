'use strict';

// fake add image
function handleFileSelect(e) {
    var files = e.target.files;

    // loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

        // only process image files.
        if (!f.type.match('image.*')) {
        continue;
    }

    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {
            // Render thumbnail.
            var list = document.getElementById('list');

            var span = document.createElement('span');
            span.innerHTML = [
                '<img src="', 
                e.target.result,
                '"/>'
            ].join('');

            list.insertBefore(span, list.childNodes[0]);
        };
    })(f);

    // Read in the image file as a data URL.
    reader.readAsDataURL(f);
    }
}

(function() {
    var uploadInput = document.getElementById('upload-photo');

    uploadInput.addEventListener('change', handleFileSelect, false);
})();