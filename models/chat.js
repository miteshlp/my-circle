module.exports = function (mongoose) {
    const options = {
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "updatedOn"
        }
    }
    const schema = {
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        isSeen: {
            type: Boolean,
            default: false
        }
    };
    const structure = new mongoose.Schema(schema, options);
    return structure;
}

