const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io'); // created socket server
const ACTIONS = require('./src/Actions');
const cors=require('cors')

const server = http.createServer(app);
const io = new Server(server);


app.use(cors())

app.use(cors()); //used for interconnection between URL.
// app.use((req, res, next) => {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

app.use(express.static(path.join(__dirname ,"./build")));
app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname,"./build/index.html"))
})

// Chat System
io.on("connection",(socket)=>{
    console.log("new conn");
    const users=[{}];
    let newuser;

    socket.on('joined',({user})=>{
        newuser=user
        users[socket.id]=user;
        socket.broadcast.emit('userjoined',{user:"Admin",message:`${user} has joined`});
    })

    socket.emit('welcome',{user:"Admin", message:`welcome`});

    socket.on('disconnected',()=>{
        socket.broadcast.emit("leave", {user:"Admin",message:`${users[socket.id]} has left`})
        console.log(`${users[socket.id]} has left`) ;
    })

    socket.on('message',({message,id})=>{
        io.emit('sendMessage',{user:users[id],message,id});
    })
})

// Editor System
const userSocketMap = {};
function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
