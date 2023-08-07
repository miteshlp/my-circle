module.exports = function (mongoose) {
    const options = {
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "updatedOn"
        }
    }
    const schema = {
        name: {
            first: {
                type: String,
                required: true
            },
            last: {
                type: String,
                required: true
            },
            full: String
        },
        email: {
            type: String,
            required: true
        },
        gender: {
            type: String,
            enum: ["male", "female"],
            required: true
        },
        password: {
            type: String,
            required: true
        },
        account_privacy: {
            type: String,
            enum: ["public", "private"],
            default: "private"
        },
        last_chat_with: {
            type: mongoose.Schema.Types.ObjectId,
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        path: String
    };
    const structure = new mongoose.Schema(schema, options);
    return structure;
}

