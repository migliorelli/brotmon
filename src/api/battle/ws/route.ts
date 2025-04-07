import { BattleStore } from "@/lib/battleStore";
import { NextRequest } from "next/server";
import { WebSocketServer } from "ws";

let wss: WebSocketServer | null = null;
const clients = new Map();
const battleStore = new BattleStore();

function getWebSocketServer() {
  if (wss) return wss;

  wss = new WebSocketServer({ noServer: true });

  // handle connection
  wss.on("connection", (ws) => {
    let username: string | null = null;

    ws.on("message", (message: string) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === "join" && data.username) {
          username = data.username;
          clients.set(ws, username);

          // Broadcast updated user count
          broadcastUserCount();

          // Send welcome message
          ws.send(
            JSON.stringify({
              type: "message",
              sender: "System",
              content: `Welcome to the chat, ${username}!`,
              timestamp: Date.now(),
            })
          );

          // Broadcast join message to others
          broadcastMessage(
            {
              type: "message",
              sender: "System",
              content: `${username} has joined the chat`,
              timestamp: Date.now(),
            },
            ws
          );
        }

        // Handle chat message
        if (data.type === "message" && data.content && username) {
          // Broadcast the message to all clients
          broadcastMessage({
            type: "message",
            sender: data.sender,
            content: data.content,
            timestamp: data.timestamp,
          });
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });

    // Handle disconnection
    ws.on("close", () => {
      if (username) {
        // Broadcast leave message
        broadcastMessage({
          type: "message",
          sender: "System",
          content: `${username} has left the chat`,
          timestamp: Date.now(),
        });

        // Remove client
        clients.delete(ws);

        // Broadcast updated user count
        broadcastUserCount();
      }
    });
  });

  return wss;
}

// Broadcast message to all clients or all except the sender
function broadcastMessage(message: any, exclude?: any) {
  const messageStr = JSON.stringify(message);

  wss?.clients.forEach((client) => {
    if (client !== exclude && client.readyState === 1) {
      // 1 = WebSocket.OPEN
      client.send(messageStr);
    }
  });
}

// Broadcast user count to all clients
function broadcastUserCount() {
  const count = clients.size;
  const message = JSON.stringify({
    type: "users",
    count,
  });

  wss?.clients.forEach((client) => {
    if (client.readyState === 1) {
      // 1 = WebSocket.OPEN
      client.send(message);
    }
  });
}

export async function GET(req: NextRequest) {
  const upgrade = req.headers.get("upgrade");
  const connection = req.headers.get("connection");

  // check if this is a WebSocket request
  if (upgrade !== "websocket" || !connection?.includes("upgrade")) {
    return new Response("Expected WebSocket request", { status: 426 });
  }

  try {
    const socket = await (req as any).socket;

    if (!socket) {
      return new Response("Failed to get socket", { status: 500 });
    }

    const wss = getWebSocketServer();

    wss.handleUpgrade(req as any, socket, Buffer.from([]), (ws) => {
      wss.emit("connection", ws, req);
    });

    return new Response(null, {
      status: 101,
      headers: {
        Upgrade: "websocket",
        Connection: "Upgrade",
      },
    });
  } catch (error) {
    console.error("WebSocket upgrade error:", error);
    return new Response("WebSocket upgrade error", { status: 500 });
  }
}
