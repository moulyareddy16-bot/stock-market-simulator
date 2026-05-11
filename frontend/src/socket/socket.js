import { io }
from "socket.io-client";


// create socket connection
export const socket = io(

   "http://localhost:5000",

   {
      transports: ["websocket"]
   }

);
