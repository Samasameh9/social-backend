import { AccountStatusEnum, GenderEnum, PrivacyEnum, ProviderEnum, RoleEnum } from "../enum/user.enum.js";


export interface IUser {
  status:AccountStatusEnum;
  changeStatusAt?:Date;
  firstName: String;
  lastName: String;
  username?:string
  email: String;
  password: String;
  DOB?: string;
  image?: String;
  coverImage?: String[];
  confirmEmail?: Date;
  phone?: String;
  changeCredentialsTime?: Date;
  twoStepVerification?: Boolean;
  gender: GenderEnum;
  role: RoleEnum;
  provider: ProviderEnum;
  createdAt?:string;
  updatedAt?:string;
  privacy:PrivacyEnum;
  followers:String[];
  following:String[];
}
