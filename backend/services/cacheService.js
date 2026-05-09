import NodeCache from "node-cache";

// CACHE INSTANCE

export const stockCache = new NodeCache({

   stdTTL: 60, // 60 seconds

   checkperiod: 120

});