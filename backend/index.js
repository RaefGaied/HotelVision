import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";

//security packages
import helmet from "helmet";
import dbConnection from "./dbConfig/index.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import router from "./routes/index.js";

const __dirname = path.resolve(path.dirname(""));

dotenv.config();
const app= express();

app.use(express.static(path.join(__dirname, "views/verifiedpage.html")))

const PORT = process.env.PORT || 5000;
dbConnection()

app.use(helmet());
app.use(cors());
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({extended: true}));

app.use(morgan("dev"));
app.use(router)

app.use(errorMiddleware);

app.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT}`);
})
