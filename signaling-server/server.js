const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'OPTIONS'],
    }
});

app.use(cors());

app.get('/', (req, res) => {
    res.send('Signaling server is running...');
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', ({roomId, userName}) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-joined', {userId: socket.id, userName});
        console.log(`User ${socket.id} (name: ${userName}) joined room ${roomId}`);
    });

    socket.on('signal', ({roomId, data, to}) => {
        if (to) {
            io.to(to).emit('signal', {sender: socket.id, data});
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 4008;
server.listen(PORT, () => {
    console.log(`Signaling Server running on http://localhost:${PORT}`);
});
