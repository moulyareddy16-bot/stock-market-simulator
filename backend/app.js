import exp from "express"

import {authRouter} from "./routes/authRoute"

const app = express()

// Middleware
app.use(exp.json());

// Routes
app.use("/api/auth", authRouter);

export default app;