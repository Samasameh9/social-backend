"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const base_repository_js_1 = require("./base.repository.js");
const user_model_js_1 = require("../../DB/model/user.model.js");
class UserRepository extends base_repository_js_1.DatabaseRepository {
    constructor() {
        super(user_model_js_1.UserModel);
    }
}
exports.UserRepository = UserRepository;
