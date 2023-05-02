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
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        comment : {
            type : String,
            required :  true
        }
    };
    const structure = new mongoose.Schema(schema, options);
    return structure;
}

