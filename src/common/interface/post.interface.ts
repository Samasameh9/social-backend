import mongoose from "mongoose"

export interface IPost{
        createdBy: mongoose.Types.ObjectId;
        content?:  string;
        attachments?:string[] ;
        likes?:mongoose.Types.ObjectId[];
        commentsCount?: number;
        isDeleted?:boolean
}