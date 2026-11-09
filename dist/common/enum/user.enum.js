"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyEnum = exports.ProviderEnum = exports.RoleEnum = exports.GenderEnum = void 0;
var GenderEnum;
(function (GenderEnum) {
    GenderEnum[GenderEnum["Male"] = 0] = "Male";
    GenderEnum[GenderEnum["Female"] = 1] = "Female";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var RoleEnum;
(function (RoleEnum) {
    RoleEnum[RoleEnum["USER"] = 0] = "USER";
    RoleEnum[RoleEnum["ADMIN"] = 1] = "ADMIN";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
var ProviderEnum;
(function (ProviderEnum) {
    ProviderEnum[ProviderEnum["SYSTEM"] = 0] = "SYSTEM";
    ProviderEnum[ProviderEnum["GOOGLE"] = 1] = "GOOGLE";
})(ProviderEnum || (exports.ProviderEnum = ProviderEnum = {}));
var PrivacyEnum;
(function (PrivacyEnum) {
    PrivacyEnum[PrivacyEnum["PUBLIC"] = 0] = "PUBLIC";
    PrivacyEnum[PrivacyEnum["PRIVATE"] = 1] = "PRIVATE";
})(PrivacyEnum || (exports.PrivacyEnum = PrivacyEnum = {}));
