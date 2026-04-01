const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });
const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const mongoose = require("mongoose");

// giả lập user hiện tại (nếu bạn chưa có auth)
const fakeAuth = (req, res, next) => {
  req.user = { id: "67f123abc456def789000002" }; // thay bằng user trong DB
  next();
};

router.use(fakeAuth);


// ================== API 1 ==================
router.get("/:userID", async (req, res) => {
  const currentUser = req.user.id;
  const userID = req.params.userID;

  const messages = await Message.find({
    $or: [
      { from: currentUser, to: userID },
      { from: userID, to: currentUser }
    ]
  }).sort({ createdAt: 1 });

  res.json(messages);
});


// ================== API 2 ==================
router.post("/", upload.single("file"), async (req, res) => {
  const currentUser = req.user.id;
  const { to, text } = req.body;

  let messageContent = {};

  if (req.file) {
    messageContent = {
      type: "file",
      fileUrl: req.file.filename
    };
  } else {
    messageContent = {
      type: "text",
      text: text
    };
  }

  const message = new Message({
    from: currentUser,
    to,
    messageContent
  });

  await message.save();

  res.json(message);
});


// ================== API 3 ==================
router.get("/", async (req, res) => {
  try {
    const currentUser = new mongoose.Types.ObjectId(req.user.id);

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { from: currentUser },
            { to: currentUser }
          ]
        }
      },
      {
        $addFields: {
          user: {
            $cond: [
              { $eq: ["$from", currentUser] },
              "$to",
              "$from"
            ]
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$user",
          lastMessage: { $first: "$$ROOT" }
        }
      }
    ]);

    res.json(
      messages.map(m => ({
        user: m._id,
        lastMessage: m.lastMessage.messageContent,
        time: m.lastMessage.createdAt
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;