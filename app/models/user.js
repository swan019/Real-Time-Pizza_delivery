const mongoose = require('mongoose');

// Define the schema
const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
    },
    lname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // match: [/.+\@.+\..+/, 'Please fill a valid email address'], // Email validation regex
    },
    number: {
        type: String,
        required: true,
        // match: [/^\d{10}$/, 'Please fill a valid 10-digit phone number'], // Phone number validation regex
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type:  String,
        default: 'customer'
    }
}, {
    // Add timestamps for createdAt and updatedAt fields
    timestamps: true,
});

// Create and export the model
const User = mongoose.model('User', userSchema);

module.exports = User;
