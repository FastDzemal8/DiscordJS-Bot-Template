const mongoose = require("mongoose");

const BerrySchema = new mongoose.Schema({
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
const Berry = mongoose.model('Berry', BerrySchema);

module.exports = Berry;
