let express = require('express');
let router = express.Router();
let Accounts = require('../models/accountModel');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

router.get('/snaps',(req,res)=> {
    res.render('clickSnaps');
});

router.post('/snaps',(req,res)=> {
    let file = req.file;

    
}); 