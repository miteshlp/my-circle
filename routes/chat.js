var express = require('express');
var router = express.Router();
const chatsController = require('../controllers/chats');
"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"

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: "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",
});
const openai = new OpenAIApi(configuration);

async function chatAPI(content) {
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-16k",
        messages: [
            {
                "role": "user",
                "content": content
            },
        ],
        temperature: 0.5,
        max_tokens: 15385,
    });
    return response.data.choices[0].message.content;
}

router.get('/chats', async function (req, res, next) {
    try {
        const allUsers = await chatsController.getChatUsers(req.user._id);
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
        const otherUser = await db.models.user.findOne({ _id: req.params.chatPartner }, { name: "$name.full", path: 1 }).lean();
        const chat = await chatsController.getChats(req.user._id, req.params.chatPartner);
        res.render('./users/chats', { chat: chat, chatPartner: otherUser, layout: "blank" });
    } catch (err) {
        console.log(`err :>> `, err);
        res.status(500).json({
            "status": 500,
            "message": "Error while geting chats !"
        })
    }
});
router.post('/chats/message', async function (req, res, next) {
    try {
        if (req.body.message?.length) {
            if (req.body.receiverId) {
                await db.models.chat.create({ receiverId: req.body.receiverId, senderId: req.user._id, message: req.body.message });
                io.to(req.body.receiverId).emit("newmessage", {
                    name: req.user.name.full,
                    path: req.user.path,
                    message: req.body.message
                });
                if (req.body.receiverId == "64ba6af81ebfa6cb3b079690") {
                    setTimeout(async () => {
                        let answer = await chatAPI(req.body.message);
                        await db.models.chat.create({ receiverId: req.user._id, senderId: "64ba6af81ebfa6cb3b079690", message: answer, isSeen: true });
                        io.to(req.user._id).emit("newmessage", {
                            name: "Chat AI",
                            path: "/images/chatai.jpeg",
                            message: answer
                        });
                    }, 500)
                }
            }
        }
        res.status(201).json({
            "status": 201,
            "message": "message sent !",
            "data": {
                name: req.user.name.full,
                path: req.user.path,
                message: req.body.message
            }
        })
    } catch (err) {
        console.log(`err :>> `, err);
        res.status(500).json({
            "status": 500,
            "message": "Error while sending message !"
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