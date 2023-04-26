module.exports = function (mongoose) {
    const options = {
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "updatedOn"
        },
        collation: {
            locale: 'en',strength : 2
        }
    }
    const schema = {
        postby: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        path: String,
    };
    const structure = new mongoose.Schema(schema, options);
    return structure;
}

