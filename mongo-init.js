// Create user
dbAdmin = db.getSiblingDB("admin");

// Authenticate user
dbAdmin.auth({
  user: "admin",
  pwd: "admin",
  mechanisms: ["SCRAM-SHA-1"],
  digestPassword: true,
});

// Create DB and collection
db = new Mongo().getDB("my-circle");
db.createCollection("my-circle", { capped: false });

db.createUser({
    user:"mitesh",
    pwd:"mitesh",
    roles:[
     {
        role:"readWrite",
        db:"my-circle"
     }
    ],
    mechanisms:[
     "SCRAM-SHA-1"
    ]
   })

// Switch to the "my-circle" database
db = new Mongo().getDB("my-circle");

// Add user to the "users" collection
db.users.insert({
    email: "chatai@gmail.com",
    gender: "other",
    password: "Mm@2",
    account_privacy: "public",
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    path: "https://firebasestorage.googleapis.com/v0/b/my-circle-d1bbe.appspot.com/o/uploads%2Fusers%2F64ba6af81ebfa6cb3b079690.jpg?alt=media&token=bab24399-ed64-424b-b7fe-9b8777e38e07"
});

// Retrieve the user's ObjectId based on the username (assuming "chatai" is the username)
var userId = db.users.findOne({ email: "chatai@gmail.com" })._id;

// Add a post to the "posts" collection
db.posts.insert({
    postby: userId,
    title: "My circle",
    description: "Lets join now !",
    isDeleted: false,
    path: "https://firebasestorage.googleapis.com/v0/b/my-circle-d1bbe.appspot.com/o/uploads%2Fposts%2F1691580467564.jpg?alt=media&token=485ff499-00d3-4668-84d5-15a4df61aac0",
    createdOn: new Date(),
    updatedOn: new Date(),
    __v: 0
});