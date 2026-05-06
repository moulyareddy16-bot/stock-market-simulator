import { getLiveStockUpdates }
from "../services/realtimeService.js";


// REALTIME SOCKET SERVER

export const startRealtimeUpdates = (io) => {

   console.log("Socket server initialized");

   // HANDLE CLIENT CONNECTION

   io.on("connection", (socket) => {

      console.log(`User connected: ${socket.id}`);

      socket.on("disconnect", () => {
         console.log(`User disconnected: ${socket.id}`);
      });

   });


   // GLOBAL STOCK UPDATE INTERVAL
   
   setInterval(async () => {

      try {

         // Call service
         const stockUpdates =
            await getLiveStockUpdates();

         // Broadcast to all clients
         io.emit(
            "stockUpdates",
            stockUpdates
         );

      } catch (error) {

         console.log(
            "Realtime error:",
            error.message
         );

      }

   }, 5000);

};