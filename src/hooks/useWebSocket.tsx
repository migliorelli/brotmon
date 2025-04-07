import { useEffect, useRef, useState } from "react";

type Listeners = ((data: any) => void)[];

export function useWebSocket(autoConnect: boolean = true) {
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [messageEvents, setMessageEvents] = useState<Listeners>([]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/battle/ws`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      console.log("WebSocket connection established");
      setConnected(true);
    });

    socket.addEventListener("close", () => {
      console.log("WebSocket connection closed");
      setConnected(false);
    });

    socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      setError("An error occurred while connecting to the server");
      socket.close();
    });

    return () => {
      socket.close();

      messageEvents.forEach((listener) =>
        socket.removeEventListener("message", listener)
      );
    };
  }, [messageEvents]);

  const send = (type: string, data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, data }));
    }
  };

  const event = (type: string, handler: (data: any) => void) => {
    if (socketRef.current) {
      const messageHandler = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        if (message.type === type) {
          handler(message.data);
        }
      };

      socketRef.current.addEventListener("message", messageHandler);
      setMessageEvents((prev) => [...prev, messageHandler]);
    }
  };

  return { socket: socketRef, connected, error, send, event };
}
