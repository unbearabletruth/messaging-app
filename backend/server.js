const express = require("express");
const cors = require("cors");
require('dotenv').config();
const mongoose = require("mongoose");
const chatsRouter = require('./routes/chat');
const userRouter = require('./routes/user');
const path = require('path');
const User = require("./models/user");
const { timeStamp } = require("console");

const port = process.env.PORT || 5000;
const app = express();

mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO;

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoDB, { 
    useUnifiedTopology: true, 
    useNewUrlParser: true 
  });
}

app.use(cors());
app.use(express.json());
app.use('/chats', chatsRouter);
app.use('/users', userRouter);
app.use(express.static(path.join(__dirname, 'public')));

app.use((err, req, res, next) => {
  const message = err.message
  res.status(500).json({message})
});
 
const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

const io = require('socket.io')(server, {
  cors: { 
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']
  },
  pingTimeout: 60000
})

let users = []

io.on("connection", (socket) => {
  console.log('connected to socket.io')

  socket.on('setup', (user) => {
    socket.join(user._id)
    console.log('user connected', user.username)
  })

  socket.on('online', (user) => {
    if (!users.some((u) => u === user._id)) {
      users.push(user._id);
    }
    console.log("online", user.username);
    io.emit('online', users)
  })

  socket.on("offline", async (user) => {
    users = users.filter((u) => u !== user._id);
    console.log("offline", user.username);
    await User.findByIdAndUpdate(user._id, {
      lastSeen: Date.now()
    }, { new: true })
    io.emit("online", users);
  });

  socket.on('joined chat', (chat) => {
    socket.join(chat)
    console.log('user joined chat:', chat)
  })

  socket.on('new message', (message, chat) => {
    chat.users.forEach(user => {
      if (user._id !== message.author._id) {
        socket.in(user._id).emit('receive message', message)
      }
    });
  })

  socket.on('new timestamp', (chat, timestamp) => {
    console.log(chat)
    chat.users.forEach(user => {
      if (user._id !== timestamp.id) {
        socket.in(user._id).emit('receive timestamp', chat)
      }
    });
  })

  socket.off('setup', () => {
    console.log('user disconnected', user.username)
    socket.leave(user._id)
  })
})