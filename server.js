import { WebSocketServer } from "ws";

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (socket) => {
  socket.on("message", (data) => {
    const { type } = JSON.parse(data);
    if (type !== "ping") return;

    setTimeout(() => {
      socket.send(JSON.stringify({ type: "pong" }));
    });
  });
});

console.log(`WebSocket server listening on ws://localhost:${PORT}`);
