const WebSocket = require('ws');

// Rooms mapping: serverId -> Set of clients
const rooms = {};

// Create WebSocket server
const wss = new WebSocket.Server({ port: 10000 }, () => {
    console.log(`[LOG]   ${getTime()} > WebSocket server running on ws://{ip}:10000`);
});

wss.on('connection', (ws) => {
    let thisRoomIds = new Set(); // per-client serverId
    console.log(`[LOG]   ${getTime()} > Client connected`);

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log(`[DATA]  ${getTime()} >`);
        console.log(data);

        if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }

        else if (data.type === 'register') {
            const thisRoomId = data.roomId;
            const secret = data.roomSecret;

            if (!thisRoomId || !secret) {
                ws.send(JSON.stringify({ type: 'error', message: 'roomId and roomSecret are required to register' }));
                return;
            }
            
            if (rooms[thisRoomId]) {
                if (rooms[thisRoomId].secret && rooms[thisRoomId].secret !== secret) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Invalid secret for this room' }));
                    return;
                }

                rooms[thisRoomId].clients.add(ws);
                rooms[thisRoomId].clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN && client !== ws) {
                        client.send(JSON.stringify({ type: 'ws_join', message: 'A client has joined this room!' }));
                    }
                });
            } else {
                rooms[thisRoomId] = {
                    secret: secret || null,
                    clients: new Set(),
                }

                rooms[thisRoomId].clients.add(ws);
                console.log(`[LOG]   ${getTime()} > Client created room: ${thisRoomId}`);
            }

            console.log(`[LOG]   ${getTime()} > Client registered to room: ${thisRoomId}`);
            thisRoomIds.add(thisRoomId); // store for this client
            ws.send(JSON.stringify({ type: 'registered', roomId: thisRoomId }));

        } else if (data.type === 'unregister') {
            const thisRoomId = data.roomId; // ✅ keep it local
            if (!thisRoomId) return;

            if (!rooms[thisRoomId]) {
                ws.send(JSON.stringify({ type: 'error', message: 'Room does not exist' }));
                return;
            }

            rooms[thisRoomId].clients.delete(ws);

            if (rooms[thisRoomId].clients.size === 0) {
                delete rooms[thisRoomId];
            } else {
                rooms[thisRoomId].clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN && client !== ws) {
                        client.send(JSON.stringify({ type: 'ws_leave', message: 'A client has left this room!' }));
                    }
                });
            }

            thisRoomIds.delete(thisRoomId);

            console.log(`[LOG]   ${getTime()} > Client unregistered from room: ${thisRoomId}`);

            ws.send(JSON.stringify({ type: 'unregistered', roomId: thisRoomId }));
        } else {
            if (thisRoomIds) {
                thisRoomIds.forEach((id) => {
                    rooms[id].clients.forEach(client => {
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
        console.log("[LOG]   " + getTime() + " > Client disconnected");
    });
});



function getTime() {
    return new Date().toTimeString().split(' ')[0];
}