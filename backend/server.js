import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);

  ws.on("message", (message) => {
    // Expect JSON: { senderId, username, text }
    let data;
    try {
      data = JSON.parse(message.toString());
    } catch {
      // fallback for plain text
      data = {
        senderId: null,
        username: "Anonymous",
        text: message.toString(),
      };
    }

    // Log message content, sender ID, and username
    console.log(
      `[Message] Sender ID: ${data.senderId}, Username: ${data.username}, Text: ${data.text}`,
    );

    // Broadcast to all clients
    for (let client of clients) {
      if (client.readyState === 1) {
        client.send(JSON.stringify(data));
      }
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

console.log("WebSocket server running on ws://localhost:8080");
