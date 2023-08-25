const express = require("express");
const cors = require("cors");
require('dotenv').config();
const mongoose = require("mongoose");
const chatsRouter = require('./routes/chat');
const userRouter = require('./routes/user');

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
  })

  socket.on('new message', (message, chat) => {
    chat.users.forEach(user => {
      socket.in(user._id).emit('receive message', message)
    });
  })
})