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
 
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});