import mongoose from "mongoose";
import { AccountStatusEnum, GenderEnum, PrivacyEnum, ProviderEnum, RoleEnum } from "../enum/user.enum.js";


export interface IUser {
  status:AccountStatusEnum;
  changeStatusAt?:Date;
  firstName: string;
  lastName: string;
  username?:string
  email: string;
  password: string;
  DOB?: string;
  image?: string;
  coverImage?: string[];
  confirmEmail?: Date;
  phone?: string;
  changeCredentialsTime?: Date;
  twoStepVerification?: boolean;
  gender: GenderEnum;
  role: RoleEnum;
  provider: ProviderEnum;
  createdAt?:Date;
  updatedAt?:Date;
  privacy:PrivacyEnum;
  followers:mongoose.Types.ObjectId[] ;
  following:mongoose.Types.ObjectId[];
}
