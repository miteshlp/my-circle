module.exports = function (mongoose) {
    const options = {
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "updatedOn"
        }
    }
    const schema = {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    };
    const structure = new mongoose.Schema(schema, options);
    return structure;
}

