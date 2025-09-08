const WebSocket = require('ws');

// Rooms mapping: serverId -> Set of clients
const rooms = {};

// Create WebSocket server
const wss = new WebSocket.Server({ port: 10000 }, () => {
    console.log('WebSocket server running on ws://localhost:10000');
});

wss.on('connection', (ws) => {
    let thisRoomIds = new Set(); // per-client serverId
    console.log('Client connected');

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }

        else if (data.type === 'register') {
            const thisRoomId = data.roomId;
            thisRoomIds.add(thisRoomId); // store for this client
            if (!thisRoomId) return;

            if (!rooms[thisRoomId]) rooms[thisRoomId] = new Set();
            rooms[thisRoomId].add(ws);

            console.log(`Client registered to room: ${thisRoomId}`);
            
            rooms[thisRoomId].forEach((client) => {
                if (client.readyState === WebSocket.OPEN && client !== ws) {
                    client.send(JSON.stringify({ type: 'ws_join', message: 'A client has joined this room!' }));
                }
            });

            ws.send(JSON.stringify({ type: 'registered', roomId: thisRoomId }));

        } else if (data.type === 'unregister') {
            const thisRoomId = data.roomId; // ✅ keep it local
            if (!thisRoomId) return;

            if (!rooms[thisRoomId]) {
                ws.send(JSON.stringify({ type: 'error', message: 'Room does not exist' }));
                return;
            }

            rooms[thisRoomId].delete(ws);
            if (rooms[thisRoomId].size === 0) delete rooms[thisRoomId];

            thisRoomIds.delete(thisRoomId);

            console.log(`Client unregistered from room: ${thisRoomId}`);

            ws.send(JSON.stringify({ type: 'unregistered', roomId: thisRoomId }));
        } else {
            if (thisRoomIds) {
                thisRoomIds.forEach((id) => {
                    rooms[id].forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(`${message}`);
                        }
                    });
                });
            }
        }
    });

    ws.on('close', () => {
        if (thisRoomIds) {
            thisRoomIds.forEach(id => {
                if (rooms[id]) {
                    rooms[id].delete(ws);
                    if (rooms[id].size === 0) delete rooms[id];
                }
            });
        }
        console.log('Client disconnected');
    });
});
