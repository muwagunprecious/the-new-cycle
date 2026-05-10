const { Server } = require('socket.io');

let io;
const userSockets = new Map();

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        
        if (userId && userId !== 'undefined') {
            userSockets.set(userId, socket.id);
            console.log(`User connected: ${userId} (Socket: ${socket.id})`);
        }

        socket.on('disconnect', () => {
            if (userId) {
                userSockets.delete(userId);
                console.log(`User disconnected: ${userId}`);
            }
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

const emitToUser = (userId, event, data) => {
    const socketId = userSockets.get(userId);
    if (socketId) {
        io.to(socketId).emit(event, data);
        return true;
    }
    return false;
};

module.exports = {
    initSocket,
    getIO,
    emitToUser
};
