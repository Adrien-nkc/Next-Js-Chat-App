"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatComponent() {
  const [messages, setMessages] = useState<
    { senderId: string; username: string; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Step 1: Username logic replaced with Start Chat button
  const [username, setUsername] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");

  // Step 2: Assign a random client ID for this user
  const clientIdRef = useRef(Math.random().toString(36).substr(2, 9));

  // Step 3: Setup WebSocket connection only after username is set
  useEffect(() => {
    if (!username) return; // wait for Start Chat

    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    // Create Audio object once
    const audio = new Audio("/Notification.wav");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Add message to state
      setMessages((prev) => [...prev, data]);

      // Play notification sound ONLY if the message is from another user
      if (data.senderId !== clientIdRef.current) {
        audio.currentTime = 0; // allow spam notifications
        audio.play().catch((err) => console.log("Audio play error:", err));
      }
    };

    ws.onclose = () => console.log("Disconnected from server");

    return () => ws.close();
  }, [username]);

  // Step 4: Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Step 5: Send message with username
  const sendMessage = () => {
    if (!input.trim() || !wsRef.current || !username) return;

    const message = {
      senderId: clientIdRef.current,
      username, // include username
      text: input,
    };

    wsRef.current.send(JSON.stringify(message));
    setInput(""); // only clear input
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  // --- Render Start Chat screen if username not set ---
  if (!username) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <h1 className="text-4xl font-bold mb-4">Welcome to Chat</h1>
        <input
          type="text"
          placeholder="Enter your name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="mb-4 px-4 py-2 border rounded outline-none"
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
          onClick={() => {
            setUsername(nameInput.trim() || "Guest");

            // Play Welcome.wav when the user starts the chat
            const welcomeAudio = new Audio("/Welcome.wav");
            welcomeAudio
              .play()
              .catch((err) => console.log("Welcome audio play error:", err));
          }}
        >
          Start Chat
        </button>
      </main>
    );
  }

  // --- Render Chat UI ---
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-4">Chat</h1>
      <div className="flex flex-col w-150 h-200 bg-white rounded-xl">
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
          {messages.map((msg, index) => {
            const isMe = msg.senderId === clientIdRef.current;
            return (
              <div
                key={index}
                className={`max-w-[70%] px-4 py-2 rounded-2xl wrap-break-words ${
                  isMe
                    ? "self-end bg-blue-600 text-white"
                    : "self-start bg-gray-200 text-black"
                }`}
              >
                <strong>{msg.username}:</strong> {msg.text}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-300 flex">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 outline-none text-black"
          />
        </div>
      </div>
    </main>
  );
}
