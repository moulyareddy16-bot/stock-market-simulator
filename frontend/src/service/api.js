import axios from "axios";


// AXIOS INSTANCE

const api = axios.create({

   // backend base URL
   baseURL: "http://localhost:5000/api",

   // send cookies automatically
   withCredentials: true

});


// export instance
export default api;