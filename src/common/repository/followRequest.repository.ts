import { DatabaseRepository } from "./base.repository.js";
import { FollowRequestModel } from "../../DB/model/followRequest.model.js";
import { IFollowRequest } from "../interface/followRequest.interface.js";


export class FollowRequestRepository extends DatabaseRepository<IFollowRequest> {
  constructor() {
    super(FollowRequestModel);
  }
}
