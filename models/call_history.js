module.exports = function (mongoose) {
    const options = {
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "updatedOn"
        },
        collection:"call_history"
    }
    const schema = {
        caller: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        status: {
            type: String,
            enum: ["in-progress", "completed"],
        },
        room: {
            type: String,
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    };
    const structure = new mongoose.Schema(schema, options);
    return structure;
}

