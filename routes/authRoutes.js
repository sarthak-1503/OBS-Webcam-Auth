let express = require("express");
let bcrypt = require("bcrypt");
// let cv = require('opencv4nodejs');
// let io = require('socket.io')
let mongoose = require("mongoose");
let router = express.Router();
let Accounts = require("../models/accountModel");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const crypto = require("crypto");
const path = require("path");
const methodOverride = require("method-override");
// let spawn = require("child_process").spawn;
let {PythonShell} = require('python-shell');
let requireLogin = require('../middlewares/AuthMiddleware');
var ObjectId = require("mongodb").ObjectID;
let conn = require("../DB-Connect/connect-db").conn;

const dbUrl = "mongodb://localhost:27017/obsdb";
const secret = "betterkeepitasasecret";
// let sendOTP = require("../Operations/otpGeneration");

let gfs;

conn.on("open", () => {
  console.log("database connected!");
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Create storage engine
const storage = new GridFsStorage({
  url: dbUrl,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const fileInfo = {
          bucketName: "uploads",
          filename: file.originalname,
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });

router.get("/login", async (req, res) => {
  res.render("login", { id: null, lastUrl: Accounts.referrer, record : null });
});

router.post("/login", async (req, res) => {
  let email = req.body.Email,
    pass = req.body.p1;

  let record = await Accounts.findOne({ email: email });

  if (record == null) {
    console.log("No account with this email exists!!");
    res.redirect("/auth/signup");
  } else {
    let check = await bcrypt.compare(pass, record.password);

    if (check == true) {

      req.session.user_id = null;
      let url = "/auth/login/validate/" + record._id;
      res.redirect(url);
    } else {
      console.log("Wrong email or password!!");
      res.redirect(303, "/auth/login");
    }
  }
});

router.get("/login/validate/:id", async (req, res) => {
  let id = req.params.id;
  console.log('id : ',id);
  let record = await Accounts.findOne({_id : id}).catch(err=> {
    console.log('id error : ',err);
  });
  let fileRecord = await gfs.files
    .find({ _id : ObjectId(record.fileId) })
    .toArray()
    .catch((err) => {
      console.log("File find error : ", err);
    });
    // console.log(fileRecord);

  let options = {
    mode: "text",
    pythonOptions: ["-u"], 
    scriptPath: "Webcam-Access",
    args: [id], 
  };

  PythonShell.run("capture-images.py", options, function (err, result) {
    if (err) throw err;
    console.log("result: ", result.toString());
  });

  res.render("FaceRecognition", {filename : fileRecord[0].filename, name : record.name, id : id});
  
});


  


router.post("/login/validate/:id", async (req, res) => {
  let id = req.params.id;
  let record = await Accounts.findOne({ _id: id });
  let conclude = req.body.conclusion;
  if(conclude === false) id = null;
  req.session.user_id = id;
  console.log(conclude)
  console.log(req.session.user_id);

  if(conclude === true) {
    
    console.log(id);
    res.redirect('/');
  } else {
    // req.session.user_id = null;
    console.log(req.session.user_id);
    res.redirect('/auth/login');
  }
  
});

router.get("/signup", (req, res) => {
  // console.log(gfs.files);
  res.render("signup", { id: req.session.user_id });
});

router.post("/signup", upload.single("file"), async (req, res) => {
  let email = req.body.email;
  let create = req.body.p1;
  let name = req.body.name;
  let filename = req.file.filename;
  let pass = create;
  var totalAmount = 0;
  let saltRounds = 10;
  // filename : "Sarthak Arora Photo.jpg"
  // let fileRecord = gfs.files.find({_id: ObjectId("619408eb7c227998a441fe46")}).toArray();

  let fileRecord = await gfs.files
    .find({ filename: filename })
    .toArray()
    .catch((err) => {
      console.log("File find error : ", err);
    });

  // .toArray()
  // console.log("gfs files", gfs.files);
  let fileId = fileRecord[0]._id;

  let logindetails = {
    name: name,
    email: email,
    password: pass,
    total_amount: totalAmount,
    fileId: fileId,
  };
  // console.log(gfs);

  console.log(fileId);
  // console.log(file);
  let record = await Accounts.findOne({ email: email });

  if (record != null && record != undefined) {
    console.log(record);
    console.log("User already exists!");
    res.status(404).send("User already exists!");
  } else {
    let salt = await bcrypt.genSalt(saltRounds).catch((err) => {
      console.log(err);
    });
    let hash = await bcrypt.hash(pass, salt).catch((err) => {
      console.log(err);
    });

    logindetails.password = hash;

    let account = await Accounts.create(logindetails).catch((err) => {
      console.log(err);
    });
    // account.save();
    // console.log(account);

    let record = await Accounts.findOne({ email: email });
    console.log(record);

    // let filerecord = await gfs.files.find({filename})

    // gfs.files.({_id})

    // let record = await Accounts.findOne({email:email});
    // console.log(email);

    console.log("Account created successfully.");
    res.redirect("/auth/login");
  }
  // res.redirect(303, "/auth/signup/" + record._id + "/click/snaps");
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
