var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, 'build/web-mobile')));

app.listen(3000);
console.log('listening on port 3000');
