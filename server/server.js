const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const MessageSchema = new mongoose.Schema({
sender: String,
text: String,
createdAt: {
type: Date,
default: Date.now
}
});

const Message = mongoose.model("Message", MessageSchema);

const TeamMessageSchema = new mongoose.Schema({
sender: String,
text: String,
createdAt: {
type: Date,
default: Date.now
}
});

const TeamMessage = mongoose.model(
"TeamMessage",
TeamMessageSchema
);

const server = http.createServer(app);

const io = new Server(server, {
cors: {
origin: "*",
methods: ["GET", "POST"]
}
});

io.on("connection", async (socket) => {

console.log("User Connected");

const history =
await Message.find().sort({ createdAt: 1 });

socket.emit("chat_history", history);

socket.on("send_message", async (data) => {

await Message.create({
sender: data.sender,
text: data.text
});

io.emit("receive_message", data);

});

socket.on("send_team_message", async (data) => {

await TeamMessage.create({
sender: data.sender,
text: data.text
});

io.emit("receive_team_message", data);

});

socket.on("typing",(data)=>{

socket.broadcast.emit("typing",data);

});

socket.on("stop_typing",(data)=>{

socket.broadcast.emit("stop_typing",data);

});

socket.on("disconnect", () => {
console.log("User Disconnected");
});

});

app.get("/", (req, res) => {
res.send("Duggu Server Running");
});

app.get("/messages", async (req, res) => {

const messages =
await Message.find().sort({ createdAt: 1 });

res.json(messages);

});

app.get("/team-messages", async (req, res) => {

const messages =
await TeamMessage.find().sort({
createdAt: 1
});

res.json(messages);

});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
console.log(`Server Running on Port ${PORT}`);
});
