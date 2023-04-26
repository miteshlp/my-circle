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
        totalPost: {
            type: Number,
            required: true
        },
        savedPost: {
            type: Number,
            required: true
        },
        savedByOthers: {
            type: Number,
            required: true
        }
    };
    const structure = new mongoose.Schema(schema, options);
    return structure;
}