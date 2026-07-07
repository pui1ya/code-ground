const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({

    name: String,

    description: String,

    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        role: String
    }],

    visibility: {
        type: String,
        default: "private"
    },

    language: String,

    githubRepo: String

}, {
    timestamps: true
});

module.exports = mongoose.model("Project", ProjectSchema);