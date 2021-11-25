let mongoose = require('mongoose');

let transactionSchema = new mongoose.Schema({
    amount: Number,
    typeOftransac: String,
    dateANDtime : Date
});

module.exports = transactionSchema;