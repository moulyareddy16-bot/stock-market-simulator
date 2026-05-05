import { config } from "dotenv";
import { connect } from "mongoose";
import app from "./app.js"
config();
zx
//connect to db
const connectDB = async () => {

  try {

    await connect(process.env.DB_URL);

    console.log("DB server connected");

    //assign port
    const port = process.env.PORT || 5000;

    app.listen(port, () =>
        console.log(`server listening on ${port}..`)
    );

  } catch (err) {

    console.log("err in db connect", err);

  }
  
};

connectDB();