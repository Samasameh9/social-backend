"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepository = void 0;
const base_repository_js_1 = require("./base.repository.js");
const comment_model_js_1 = require("../../DB/model/comment.model.js");
class CommentRepository extends base_repository_js_1.DatabaseRepository {
    constructor() {
        super(comment_model_js_1.CommentModel);
    }
}
exports.CommentRepository = CommentRepository;
