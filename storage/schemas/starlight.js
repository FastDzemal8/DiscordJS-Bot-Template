const mongoose = require("mongoose");

const StarlightSchema = new mongoose.Schema({
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
const Starlight = mongoose.model('Starlight', StarlightSchema);

module.exports = Starlight;
