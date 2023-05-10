const fs = require('fs');

module.exports =  function (mongoose) {
    mongoose.connect(process.env.url);
    const db = mongoose.connection;
    db.once('open', function () {
        console.log("Databse Connection Successful!");
    });
    
    const files = fs.readdirSync('./models');
    for (let i = 0; i < files.length; i++) {
        if(files[i] != "index.js"){
            mongoose.model(files[i].split('.')[0], require(`./${files[i]}`)(mongoose));
        }
    }
    return mongoose;
};
