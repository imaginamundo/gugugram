'use strict';

// fake add image
function handleFileSelect(e) {
    var reader = new FileReader();  
    var file = document.getElementById('upload-photo');

    reader.addEventListener('load', function() {
        var span = document.createElement('span');
        span.innerHTML = [
            '<img src="', 
            e.target.result,
            '"/>'
        ].join('');

        list.insertBefore(span, list.childNodes[0]);
    }, false);

    if (file) {
        reader.readAsDataURL(file);
    }
}

(function() {
    var list = document.getElementById('list');
    var uploadInput = document.getElementById('upload-photo');

    uploadInput.addEventListener('change', handleFileSelect);
})();


/// old

// 'use strict';

// // fake add image
// function handleFileSelect(e) {
//     var files = e.target.files;

//     // loop through the FileList and render image files as thumbnails.
//     for (var i = 0, f; f = files[i]; i++) {

//         // only process image files.
//         if (!f.type.match('image.*')) {
//             continue;
//         }

//         var reader = new FileReader();

//         // Closure to capture the file information.
//         reader.onload = (function(theFile) {
//             return function(e) {
//                 // Render thumbnail.
//                 var span = document.createElement('span');
//                 span.innerHTML = [
//                     '<img src="', 
//                     e.target.result,
//                     '"/>'
//                 ].join('');

//                 list.insertBefore(span, list.childNodes[0]);
//             };
//         })(f);

//         // Read in the image file as a data URL.
//         reader.readAsDataURL(f);

//         var request = new XMLHttpRequest();

//         request.open('POST', '/upload', true);
//         request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
//         request.send(JSON.stringify(reader.readAsDataURL(f)));

//         console.log(reader.readAsDataURL(f));
//     }
// }

// (function() {
    
//     var list = document.getElementById('list');
//     var uploadInput = document.getElementById('upload-photo');

//     uploadInput.addEventListener('change', handleFileSelect, false);
// })();