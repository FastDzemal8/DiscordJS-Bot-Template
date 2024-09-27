const mongoose = require("mongoose");

const PixieSchema = new mongoose.Schema({
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
const Pixie = mongoose.model('Pixie', PixieSchema);

module.exports = Pixie;
