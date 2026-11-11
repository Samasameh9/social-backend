import {config} from "dotenv"
export const NODE_ENV:string=process.env.NODE_ENV??"development"
config({path:`.env.${NODE_ENV}`})


export const port:number=parseInt(process.env.PORT??"9000")

// data base
export const DB_URI:string=process.env.DB_URI as string
export const REDIS_URI:string=process.env.REDIS_URI as string
export const ENC_KEY:string=process.env.ENC_KEY as string
export const IV_LENGTH:number=parseInt(process.env.IV_LENGTH?? "16") 

// access token
export const ACCESS_USER_TOKEN_SIGNATURE:string=process.env.ACCESS_USER_TOKEN_SIGNATURE as string
export const ACCESS_ADMIN_TOKEN_SIGNATURE:string=process.env.ACCESS_ADMIN_TOKEN_SIGNATURE as string
export const ACCESS_TOKEN_EXPIREIN:number=parseInt(process.env.ACCESS_TOKEN_EXPIREIN?? "1800") 

// refresh token
export const REFRESH_ADMIN_TOKEN_SIGNATURE:string=process.env.REFRESH_ADMIN_TOKEN_SIGNATURE as string
export const REFRESH_USER_TOKEN_SIGNATURE:string=process.env.REFRESH_USER_TOKEN_SIGNATURE as string
export const REFRESH_TOKEN_EXPIREIN:number=parseInt(process.env.REFRESH_USER_TOKEN_EXPIREIN?? "31536000")

// signup with gmail
export const WEB_CLIENT_IDS:string[] = process.env.WEB_CLIENT_IDS?.split(",") || [];

// send email
export const APP_PASSWORD:string=process.env.APP_PASSWORD as string
export const APP_EMAIL:string=process.env.APP_EMAIL as string

// AWS
export const AWS_ACCESS_KEY_ID:string=process.env.AWS_ACCESS_KEY_ID as string
export const APPLICATION_NAME:string=process.env.APPLICATION_NAME as string
export const AWS_BUCKET_NAME:string=process.env.AWS_BUCKET_NAME as string
export const AWS_ACCESS_SECRET_KEY:string=process.env.AWS_ACCESS_SECRET_KEY as string
export const AWS_REGION:string=process.env.AWS_REGIONAWS_REGION as string


