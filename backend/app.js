import exp from "express"
import cookieParser from "cookie-parser";
import cors from 'cors'

import authRouter from "./routes/authRoute.js"
import stockRouter from "./routes/stockRoute.js";
import transactionRouter from "./routes/transactionRoute.js";
import portfolioRouter from "./routes/portfolioRoute.js";
import alertRouter from "./routes/alertRoute.js";
import historicalRouter from "./routes/historicalRoute.js";
import userRouter from "./routes/userRoute.js";
import { getStockDetails } from "./controllers/stockController.js";




//create express app
const app = exp();


//body parser middleware
app.use(exp.json());


//add cookie parser middeleware
app.use(cookieParser())


//enable cors
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}))




// Routes
app.use("/api/auth", authRouter)

app.use("/api/stocks", stockRouter)
app.get("/api/stocks/test", (req, res) => res.json({ msg: "test" }));

app.use("/api/transactions", transactionRouter)

app.use("/api/portfolio", portfolioRouter)

app.use("/api/alerts", alertRouter)

app.use("/api/historical", historicalRouter)
app.use("/api/users", userRouter)




//to handle invalid path
app.use((req, res, next) => {
  console.log(req.url);
  res.status(404).json({ message: `path ${req.url} is invalid` });
});

//Error handling middleware
app.use((err, req, res, next) => {
  console.log("error is ", err)
  console.log("Full error:", JSON.stringify(err, null, 2));
  //ValidationError
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }
  //CastError
  if (err.name === "CastError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }
  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  //send server side error
  res.status(500).json({ message: "error occurred", error: "Server side error" });
});

export default app;