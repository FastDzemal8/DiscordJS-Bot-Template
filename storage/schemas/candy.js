const mongoose = require("mongoose");

const CandySchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        trim: true,
        index: true // Create an index for userID
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    },
    blacklisted: {
        type: Boolean,
        default: false
    }
});

// Create a model for the schema
const Candy = mongoose.model('Candy', CandySchema);

module.exports = Candy;
