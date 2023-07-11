const express = require('express');
const router=express.Router();
const User=require('../models/User');
const Chat=require('../models/chatModel');
const Message=require('../models/messageModel')
var fetchuser = require('../middleware/fetchuser');
//allMessages
router.get('/:chatId', fetchuser, async(req,res)=>{
    try {
        const messages = await Message.find({ chat: req.params.chatId })
          .populate("sender", "name pic email")
          .populate("chat");
        res.json(messages);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
})

//send Message
router.post('/', fetchuser, async(req,res)=>{
    const { content, chatId } = req.body;
    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
      }
    
      var newMessage = {
        sender: req.user.id,
        content: content,
        chat: chatId,
      };

      try {
        var message = await Message.create(newMessage);
    
        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
          path: "chat.users",
          select: "name pic email",
        });
    
        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    
        res.json(message);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
})
module.exports=router;