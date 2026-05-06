import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import { config } from "dotenv";
config();

import { connect } from "mongoose";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";

import { startRealtimeUpdates }
from "./socket/socketServer.js";

import { checkAlerts }
from "./services/alertService.js";
import { clearScreenDown } from "readline";


// CONNECT TO DATABASE

const connectDB = async () => {

  try {

    await connect(process.env.DB_URL);

    console.log("DB server connected");


    // CREATE HTTP SERVER

    const server = http.createServer(app);


    // INITIALIZE SOCKET.IO
  
    const io = new Server(server, {
        cors: {
             origin: "*",
             methods: ["GET", "POST"],
            credentials: true
        }
    });


    // START REALTIME SOCKET SYSTEM
    
    startRealtimeUpdates(io);


    // ALERT CHECKER (Phase-3)

    setInterval(() => {
      checkAlerts(io);
    }, 60000); // every 1 min


    // START SERVER

    const port = process.env.PORT || 5000;

    server.listen(port, () =>
      console.log(`Server running on ${port}`)
    );

  } catch (err) {

    console.log("Error in DB connect:", err);

  }clearScreenDown

};


// Call DB connection
connectDB();