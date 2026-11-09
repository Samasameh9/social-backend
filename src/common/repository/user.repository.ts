import { IUser } from "./../interface/user.interface";
import { AnyKeys, CreateOptions, HydratedDocument, Model } from "mongoose";
import { DatabaseRepository } from "./base.repository.js";
import { UserModel } from "../../DB/model/user.model.js";

export class UserRepository extends DatabaseRepository<IUser> {
  constructor() {
    super(UserModel);
  }
}
