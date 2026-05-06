import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"]
});

console.log("Trying to connect...");

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("❌ Connection error:", err.message);
});

socket.on("stockUpdates", (data) => {
  console.log("📊 LIVE DATA:", data);
});

socket.on("alertTriggered", (data) => {
  console.log("🚨 ALERT:", data);
});

socket.on("disconnect", () => {
  console.log("⚠️ Disconnected");
});