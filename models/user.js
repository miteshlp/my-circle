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
    isDeleted: {
        type: Boolean,
        default: false
    },
    path: String
};

module.exports = function (mongoose) {
    const structure = new mongoose.Schema(schema, options);
    return structure;
}

