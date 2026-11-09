
import { HUser } from '../../../DB/model/user.model.js';

export interface ILoginResponse {
  access_token: String;
  refresh_token: String;
  twoStepRequired?:boolean
}

export interface ISignupWithGmailResponse {
  status: number;
  data: ILoginResponse
}


