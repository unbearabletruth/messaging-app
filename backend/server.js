const express = require("express");
const cors = require("cors");
require('dotenv').config();
const mongoose = require("mongoose");
const chatsRouter = require('./routes/chat');
const userRouter = require('./routes/user');
const path = require('path');

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
 
const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

const io = require('socket.io')(server, {
  cors: { 
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']
  },
  pingTimeout: 60000
})

io.on("connection", (socket) => {
  console.log('connected to socket.io')

  socket.on('setup', (user) => {
    socket.join(user.id)
    socket.emit('connected')
    console.log('user connected', user.id)
  })

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

  socket.off('setup', () => {
    console.log('user disconnected')
    socket.leave(user._id)
  })
})