const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    },

    folderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder"
    },

    name: String,

    extension: String,

    language: String,

    content: String,

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("File", FileSchema);