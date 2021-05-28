const bodyParser = require('body-parser');
const Express = require('express');

const studentRoute = require('./router/studentRouter')();

let app = Express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use('/v1_0/Control_Escolar',studentRoute);
module.exports = app;