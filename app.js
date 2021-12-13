let express = require("express");
let mongoose = require("mongoose");
let bodyParser = require("body-parser");
let bcrypt = require("bcrypt");
let nodemon = require("nodemon");
let favicon = require("serve-favicon");
let session = require("express-session");
let app = express();
let sessionConfig = require('./DB-Connect/connect-db').sessionConfig;
let conn = require('./DB-Connect/connect-db').conn;

const dbUrl = 'mongodb://localhost:27017/obsdb';
const secret = 'betterkeepitasasecret';

let authRoutes = require('./routes/authRoutes');
let accountRoutes = require('./routes/accountRoutes');
let homeRoutes = require('./routes/homeRoutes');
let Accounts = require('./models/accountModel');

app.set("view engine", "ejs");
app.use(favicon('./public/images/favicon.ico'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use('/base',express.static('./'));
app.use(bodyParser.json());
app.use(express.json());
app.use(session(sessionConfig));



app.use('/', homeRoutes)
app.use('/auth', authRoutes);
app.use('/account', accountRoutes);


let port = 3000;

app.listen(port, () => {
    console.log(`The server is listening on ${port}`);
});
