import  express  from "express";
import { authenticationController, userController } from "./modules/index";
import { globalErrorHandling } from "./middleware/error.middleware.js";
import { port } from "./config.js";
import { bootstrapDB } from "./DB/connection.db.js";
import cors from "cors";


const app:express.Application=express();


app.use(cors(),express.json())
bootstrapDB(app,port)

app.all("/",async (req:express.Request,res:express.Response,next:express.NextFunction):Promise<express.Response>=>{
return res.status(200).json({message:"done"})
 
})

app.use("/auth",authenticationController)
app.use("/user",userController)

app.use(globalErrorHandling)


