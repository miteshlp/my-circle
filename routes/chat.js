var express = require('express');
var router = express.Router();
const chat_controller = require('../controllers/chats');
const video_call_controller = require('../controllers/video_call');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const promptObject = {};



// peer connection for video call
const { v4: uuidv4 } = require("uuid");

async function chatAPI(content, user) {
    try {
        if (!promptObject[user]) {
            promptObject[user] = [];
        }
        promptObject[user].push(content);
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo-16k",
            messages: promptObject[user],
            temperature: 0.5,
            max_tokens: 15385,
        });
        promptObject[user].push({
            role: 'assistant',
            content: response.data.choices[0].message.content
        });
        return response.data.choices[0].message;
    } catch (error) {
        console.log(`error :>> `, error);
    }
}

router.get('/chats', async function (req, res, next) {
    try {
        const allUsers = await chat_controller.getChatUsers(req.user._id);
        res.render('./users/chatBox', { allUsers: allUsers });
    } catch (err) {
        console.log(`err :>> `, err);
        res.status(500).json({
            "status": 500,
            "message": "Error while geting chats user list !"
        })
    }
});

router.get('/get-user-chat/:chatPartner', async function (req, res, next) {
    try {
        const chatPartner = req.params.chatPartner;
        const otherUser = await db.models.user.findOne({ _id: chatPartner }, { name: "$name.full", path: 1 }).lean();
        const chat = await chat_controller.getChats(req.user._id, chatPartner);
        const result = await video_call_controller.is_call_in_progress(req.user._id, chatPartner);
        res.render('./users/chats', { chat: chat, chatPartner: otherUser, running_call: result[0], layout: "blank" });
    } catch (err) {
        console.log(`err :>> `, err);
        res.status(500).json({
            "status": 500,
            "message": "Error while geting chats !"
        })
    }
});
router.post('/chats/message', async function (req, res, next) {
    let errorMessage;
    try {
        if (req.body.message?.length) {
            if (req.body.receiverId) {
                await db.models.chat.create({ receiverId: req.body.receiverId, senderId: req.user._id, message: req.body.message });
                io.to(req.body.receiverId).emit("newmessage", {
                    id: req.user._id,
                    name: req.user.name.full,
                    path: req.user.path,
                    message: req.body.message
                });
                if (req.body.receiverId == "64ba6af81ebfa6cb3b079690") {
                    setTimeout(async () => {
                        try {

                            let answer = await chatAPI({
                                "role": "user",
                                "content": req.body.message
                            }, req.user._id);
                            await db.models.chat.create({ receiverId: req.user._id, senderId: "64ba6af81ebfa6cb3b079690", message: answer.content, isSeen: true });
                            io.to(req.user._id).emit("newmessage", {
                                id: "64ba6af81ebfa6cb3b079690",
                                name: "Chat AI",
                                path: "/images/chatai.jpeg",
                                message: answer.content
                            });
                        } catch (error) {
                            errorMessage = "Something wrong happend with provided promopt !";
                        }
                    }, 500)
                }
            }
        }
        return res.status(201).json({
            "status": 201,
            "message": "message sent !",
            "data": {
                name: req.user.name.full,
                path: req.user.path,
                message: req.body.message
            }
        })
    } catch (err) {
        if (!errorMessage) {
            errorMessage = "Error while sending message !"
        }
        console.log(`err :>> `, err);
        res.status(500).json({
            "status": 500,
            "message": errorMessage
        })
    }
});

router.get('/P2P-video-call/:room?', async function (req, res, next) {
    try {
        if (req.params.room) {
            if (req.query?.status === "disconnect") {
                await db.models.call_history.updateOne({ room: req.params.room }, { status: "completed" });
                return res.status(200).json({
                    "status": 200,
                    "message": "Video call disconnected !"
                })
            } else if (req.query?.status === "rejected") {
                await db.models.call_history.updateOne({ room: req.params.room }, { status: "rejected" });
                io.to(req.query.receiver).emit("call-rejected");
                return res.status(200).json({
                    "status": 200,
                    "message": "Video call rejected !"
                })
            }
            return res.render('./users/video-call', { title: "Video-call | My circle", layout: "blank", roomId: req.params.room });
        }
        const { receiver } = req.query;
        if (receiver) {
            const result = await db.models.call_history.countDocuments({
                $or: [
                    {
                        receiver: new ObjectId(receiver)
                    }, {
                        caller: new ObjectId(receiver)
                    }
                ], status: 'in-progress'
            });
            if (!result) {
                const roomId = uuidv4();
                console.log(`receiver :>> `, receiver);
                await db.models.call_history.create({ receiver: receiver, caller: req.user._id, status: "in-progress", room: roomId });
                io.to(receiver).emit("incoming-call", {
                    caller: req.user._id,
                    path: req.user.path,
                    name: req.user.name.full,
                    roomId: roomId
                });
                return res.render('./users/video-call', { title: "Video-call | My circle", roomId: roomId, layout: "blank" });
            } else {
                return res.status(400).json({
                    "status": 400,
                    "message": "તમે એવા વપરાશકર્તાને કૉલ કરી રહ્યાં છો જે બીજા કૉલ પર છે !"
                })
            }
        }
    } catch (err) {
        console.log(`err :>> `, err);
        return res.status(500).json({
            "status": 500,
            "message": "Error in video-call management !"
        })
    }
});

// router.get('/chats/unSeen', async function (req, res, next) {
//     try {
//         const unSeen = await notificationController.getUnseen(req.user._id);
//         console.log(unSeen);
//         res.render('./users/unSeen', { unSeen: unSeen, layout: "blank" });
//     } catch (err) {

//         res.status(500).json({
//             "status": 500,
//             "message": "Error while geting liked post !"
//         })
//     }
// });

module.exports = router;