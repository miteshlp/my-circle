module.exports = {
    is_call_in_progress: async function (user,chatPartner) {
        const result = await db.models.call_history.aggregate([{
            $match: {
                $or: [
                    {
                        $and: [
                            {
                                receiver: new ObjectId(chatPartner)
                            }, {
                                caller: new ObjectId(user)
                            }
                        ]

                    }, {
                        $and: [
                            {
                                caller: new ObjectId(chatPartner)
                            }, {
                                receiver: new ObjectId(user)
                            }
                        ]
                    }
                ], status: 'in-progress'
            }
        }, {
            $project: { room: 1 }
        }]);
        return result;
    },
} 
