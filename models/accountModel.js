let mongoose = require('mongoose');
let transactionSchema = require('./transactionModel');

let AccountsSchema = new mongoose.Schema({
    name: String, 
    address: String,
    Mobileno1: Number,
    Mobileno2: Number,
    Phoneno: Number,
    gender: String,
    email: String,
    account_no: Number,
    // current_balance: Number,
    password: String,
    total_amount: Number,
    // otp: {
    //     type: String,
    //     default: ""
    // },
    // otpCount: {
    //     type: Number,
    //     default: 0
    // },
    // digitalSign: {
    //     type: String, 
    //     default: null
    // },
    fileId: String,
    transactions:[transactionSchema]
});

AccountsSchema.index({name : 1,email : 1,current_balance : -1});

let Accounts = mongoose.model("Accounts",AccountsSchema);

module.exports = Accounts;