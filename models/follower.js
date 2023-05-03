module.exports = function (mongoose) {
    const options = {
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "updatedOn"
        }
    }
    const schema = {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        followerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        status: {
            type: String,
            enum: ["requested", "following"],
            default: "requested"
        }
    };
    const structure = new mongoose.Schema(schema, options);
    return structure;
}

