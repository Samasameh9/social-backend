import { DatabaseRepository } from "./base.repository.js";
import { CommentModel } from "../../DB/model/comment.model.js";
import { IComment } from "../interface/comment.interface.js";

export class CommentRepository extends DatabaseRepository<IComment> {
  constructor() {
    super(CommentModel);
  }
}
