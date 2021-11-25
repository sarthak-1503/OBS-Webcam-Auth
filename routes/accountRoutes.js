let express = require("express");
let router = express.Router();
let Accounts = require("../models/accountModel");
let requireLogin = require("../middlewares/AuthMiddleware");

router.get("/transaction", requireLogin, async (req, res) => {
  let record = await Accounts.findOne({ _id: req.session.user_id });
  res.render("transaction", { id: req.session.user_id, record: record });
});

router.get("/create_acc", requireLogin, async (req, res) => {
  let record = await Accounts.findOne({ _id: req.session.user_id });
  res.render("openaccount", { id: req.session.user_id, record: record });
});

router.post("/create_acc", async (req, res) => {
  var name = req.body.name;
  var address = req.body.address;
  var email = req.body.email;
  var gender = req.body.gender;
  var Mobileno1 = req.body.Mobileno1;
  var Mobileno2 = req.body.Mobileno2;
  var Phoneno = req.body.Phoneno;
  var total_amount = 0;

  let details = {
    name: name,
    address: address,
    email: email,
    gender: gender,
    Mobileno1: Mobileno1,
    Mobileno2: Mobileno2,
    Phoneno: Phoneno,
    total_amount: total_amount,
  };

  let record = await Accounts.findOne({ _id: req.session.user_id });

  Accounts.updateOne(record, { $set: details }, (err, rec) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Account Created");
      res.redirect("/");
    }
  });
});

router.get("/personaldetails", requireLogin, async (req, res) => {
  let record = await Accounts.findOne({ _id: req.session.user_id });
  res.render("personaldetails", { id: req.session.user_id, record: record });
});

router.get("/view", requireLogin, async (req, res) => {
  let record = await Accounts.findOne({ _id: req.session.user_id });
  let Account = record;
  res.render("view", {
    Account: Account,
    record: record,
    id: req.session.user_id,
  });
});

router.post("/view", async (req, res) => {
  var total;
  var amt = req.body.trans_amount;
  amt = parseInt(amt);
  var type = req.body.trans_type;
  var date = new Date();
  let record = await Accounts.findOne({ _id: req.session.user_id });

  total = record.total_amount;
  total = parseInt(total);
  if (type == "withdrawl") {
    if (amt > 0 && amt < total) {
      Accounts.updateOne(
        record,
        {
          $set: { total_amount: total - amt },
          $push: {
            transactions: [
              { amount: amt, typeOftransac: type, dateANDtime: date },
            ],
          },
        },
        function (err, transaction) {
          if (err) {
            console.log(err);
          } else {
            console.log(transaction);
            res.redirect("/account/view");
          }
        }
      );
    } else {
      res.render("alert", { id: req.session.user_id, record : record });
    }
  } else if (type == "deposit") {
    Accounts.updateOne(
      record,
      {
        $set: { total_amount: total + amt },
        $push: {
          transactions: [
            { amount: amt, typeOftransac: type, dateANDtime: date },
          ],
        },
      },
      function (err, transaction) {
        if (err) {
          console.log(err);
        } else {
          console.log(transaction);
          res.redirect("/account/view");
        }
      }
    );
  }
});

module.exports = router;
