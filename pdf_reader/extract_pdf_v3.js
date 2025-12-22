const fs = require('fs');
const pdf = require('pdf-extraction');

let dataBuffer = fs.readFileSync('../transcendence.pdf');

pdf(dataBuffer).then(function (data) {
    console.log(data.text);
}).catch(err => {
    console.error(err);
});
