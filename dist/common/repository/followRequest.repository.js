"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowRequestRepository = void 0;
const base_repository_js_1 = require("./base.repository.js");
const followRequest_model_js_1 = require("../../DB/model/followRequest.model.js");
class FollowRequestRepository extends base_repository_js_1.DatabaseRepository {
    constructor() {
        super(followRequest_model_js_1.FollowRequestModel);
    }
}
exports.FollowRequestRepository = FollowRequestRepository;
