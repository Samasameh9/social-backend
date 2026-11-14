import { DatabaseRepository } from "./base.repository.js";
import { PostModel } from "../../DB/model/post.model.js";
import { IPost } from "../interface/post.interface.js";

export class PostRepository extends DatabaseRepository<IPost> {
  constructor() {
    super(PostModel);
  }
}
