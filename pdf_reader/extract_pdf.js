const fs = require('fs');
const pdfLib = require('pdf-parse');

let dataBuffer = fs.readFileSync('../transcendence.pdf');

let parser = pdfLib;
if (typeof pdfLib !== 'function' && typeof pdfLib.default === 'function') {
    parser = pdfLib.default;
}

if (typeof parser === 'function') {
    parser(dataBuffer).then(function (data) {
        console.log(data.text);
    }).catch(err => console.error(err));
} else {
    // Check if it's an object with keys (sometimes it exports constants but the main function is nested?)
    // Actually, looking at debug logs earlier, it was an object with NO function export at root.
    // It had "PDFParse" class.
    console.error('PDF Parse lib not a function', pdfLib);
}
