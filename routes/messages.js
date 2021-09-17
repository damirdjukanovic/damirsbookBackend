const router = require("express").Router();
const Message = require("../models/Message");

//add

router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get

router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

//update read

router.put("/:messageId", async (req, res) => {
  try {
    const message = Message.findById(req.params.messageId);
    await message.updateOne({$set: req.body});
    res.status(200).json("message updated")
  } catch(err) {
    res.status(500).json(err.message)
  }
})

//check for unread messages

router.get("/:conversationId/unread", async(req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    const isNotRead = messages.some(m => m.read === false);
    const read = !isNotRead;
    res.status(200).json(read);
  } catch(err) {
    res.status(500).json(err.message)
  }
})


module.exports = router;