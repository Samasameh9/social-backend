"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyPostEnum = exports.ReactionEnum = void 0;
var ReactionEnum;
(function (ReactionEnum) {
    ReactionEnum[ReactionEnum["LIKE"] = 0] = "LIKE";
    ReactionEnum[ReactionEnum["LOVE"] = 1] = "LOVE";
    ReactionEnum[ReactionEnum["HAPPY"] = 2] = "HAPPY";
    ReactionEnum[ReactionEnum["SAD"] = 3] = "SAD";
    ReactionEnum[ReactionEnum["CARE"] = 4] = "CARE";
})(ReactionEnum || (exports.ReactionEnum = ReactionEnum = {}));
var PrivacyPostEnum;
(function (PrivacyPostEnum) {
    PrivacyPostEnum[PrivacyPostEnum["PUBLIC"] = 0] = "PUBLIC";
    PrivacyPostEnum[PrivacyPostEnum["FRIEND"] = 1] = "FRIEND";
    PrivacyPostEnum[PrivacyPostEnum["ONLY_ME"] = 2] = "ONLY_ME";
})(PrivacyPostEnum || (exports.PrivacyPostEnum = PrivacyPostEnum = {}));
