let express = require("express");
let bcrypt = require("bcrypt");
let mongoose = require("mongoose");
let router = express.Router();
let Accounts = require("../models/accountModel");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const crypto = require("crypto");
const path = require("path");
const methodOverride = require("method-override");
const fs = require("fs");
let { PythonShell } = require("python-shell");
let requireLogin = require("../middlewares/AuthMiddleware");
var ObjectId = require("mongodb").ObjectID;
let conn = require("../DB-Connect/connect-db").conn;
// const dbUrl = "mongodb://localhost:27017/obsdb";
// const secret = "betterkeepitasasecret";
const os = require('os')

let gfs;

conn.on("open", () => {
  console.log("database connected!");
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

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
  res.render("login", { id: null, lastUrl: Accounts.referrer, record: null });
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
  console.log("id : ", id);
  let record = await Accounts.findOne({ _id: id }).catch((err) => {
    console.log("id error : ", err);
  });

  let options = {
    mode: "text",
    pythonOptions: ["-u"],
    scriptPath: "Webcam-Access",
    args: [record.name, id],
  };

  PythonShell.run("capture-images.py", options, function (err, result) {
    if (err) throw err;
    console.log("result: ", result.toString());
  });

  let fileRecord = await gfs.files.find({ _id: ObjectId(record.fileId) }).toArray().catch((err) => {
        console.log("File find error : ", err);
      })

    var readstream = gfs.createReadStream({
          filename: fileRecord[0].filename
    });
    
    console.log(fileRecord[0]);
    // res.writeHead(200, {'Content-Type': 'image/jpeg'});
    let filePath = id + "/" + record.name + ".jpg"
    // path.join(__dirname, '/../../../../' + )
    // console.log(__dirname + '/../../../../')
    console.log(filePath)

    let chunks = []

    readstream.on('data', function(chunk) {
      chunks.push(chunk)
      // res.write(chunk)
    });

    const userHomeDir = os.homedir();

    readstream.on('end',async()=> {
      console.log('readstream ended')
      console.log(chunks)

      // let captured = userHomeDir + "/Desktop/" + id + "/" + record.name + ".jpg";
      // console.log(captured)
      chunks = Buffer.concat(chunks)
        let chunk = Buffer(chunks).toString('base64')
        
        res.render("FaceRecognition", {
          name: record.name,
          id: null,
          tempId: req.params.id,
          capturedfile: filePath,
          chunk: chunk
        });
      // if(fs.existsSync(filePath) === false) {
      //   res.render('picClickAlert',{id: null});
      // } else {
        
      // }
    })
});

router.post("/login/validate/:id", async (req, res) => {
  let id = req.params.id;
  let record = await Accounts.findOne({ _id: id });
  let conclude = req.body.conclusion;
  if (conclude === false) id = null;
  req.session.user_id = id;

  fs.unlink(
    "/home/sa-coder15/Desktop/" + id + '/' + 
      record.name +
      ".jpg",
    (error) => {
      if (error) {
        console.error("there was an error:", error);
      }
    }
  );

  // fs.rmSync("/home/sa-coder15/Desktop/" + id, { recursive: true, force: true });

  console.log("successfully deleted the file source");

  console.log(conclude);
  console.log(req.session.user_id);

  if (conclude === true) {
    console.log(id);
    res.redirect("/");
  } else {
    console.log(req.session.user_id);
    res.redirect("/auth/login");
  }
});

router.get("/signup", (req, res) => {
  if (req.session.user_id != null && req.session.user_id != undefined) {
    res.render("AlreadyLoggedIn");
  } else {
    res.render("signup", { id: req.session.user_id });
  }
});

router.post("/signup", upload.single("file"), async (req, res) => {
  let email = req.body.email;
  let create = req.body.p1;
  let name = req.body.name;
  let filename = req.file.filename;
  let pass = create;
  var totalAmount =  0;
  let saltRounds = 10;

  let fileRecord = await gfs.files
    .find({ filename: filename })
    .toArray()
    .catch((err) => {
      console.log("File find error : ", err);
    });

  let fileId = fileRecord[0]._id;

  let logindetails = {
    name: name,
    email: email,
    password: pass,
    total_amount: totalAmount,
    fileId: fileId,
  };

  console.log(fileId);

});

router.get("/logout", async (req, res) => {
  req.session.destroy();

  res.redirect("/");
});

module.exports = router;
