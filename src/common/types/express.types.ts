import { HUser } from "../../DB/model/user.model.js";
import { jwtPayloadType } from "../service/token.service.js";

declare module "express-serve-static-core"{
    interface Request{
        validate:any;
        user:HUser;
        payload:jwtPayloadType
    }
}