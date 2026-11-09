"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
const user_repository_1 = require("./../../common/repository/user.repository");
const domain_exception_js_1 = require("../../common/exception/domain.exception.js");
const cashe_service_js_1 = require("../../common/service/cashe.service.js");
const security_1 = require("../../common/security");
const user_enum_js_1 = require("../../common/enum/user.enum.js");
const email_enum_js_1 = require("../../common/enum/email.enum.js");
const send_email_js_1 = require("../../common/utilis/email/send.email.js");
const email_event_js_1 = require("../../common/utilis/email/email.event.js");
const otp_js_1 = require("../../common/utilis/email/otp.js");
const service_1 = require("../../common/service");
const google_auth_library_1 = require("google-auth-library");
const config_js_1 = require("../../config.js");
class AuthenticationService {
    userRepository;
    cachService;
    tokenService;
    client;
    constructor() {
        this.cachService = cashe_service_js_1.cachService;
        this.userRepository = new user_repository_1.UserRepository();
        this.tokenService = service_1.tokenService;
        this.client = new google_auth_library_1.OAuth2Client();
    }
    async verifyGoogleAccount(idToken) {
        const ticket = await this.client.verifyIdToken({
            idToken,
            audience: config_js_1.WEB_CLIENT_IDS,
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new domain_exception_js_1.BadRequestException("Email not verified");
        }
        return payload;
    }
    async signupWithGmail({ idToken }, issuer) {
        const { email, name, picture } = await this.verifyGoogleAccount(idToken);
        const existAccount = await this.userRepository.findOne({
            filter: { email: email },
        });
        if (existAccount) {
            if (existAccount.provider != user_enum_js_1.ProviderEnum.GOOGLE) {
                throw new domain_exception_js_1.ConflictRequestException("invalid account provider");
            }
            return {
                status: 200,
                data: await this.tokenService.createLoginCredentials({
                    user: existAccount,
                    issuer,
                }),
            };
        }
        const user = await this.userRepository.createOne({
            data: {
                email,
                username: name,
                confirmEmail: new Date(),
                provider: user_enum_js_1.ProviderEnum.GOOGLE,
                image: picture,
            },
        });
        return {
            status: 201,
            data: await this.tokenService.createLoginCredentials({ user, issuer }),
        };
    }
    async signup({ username, email, password, gender, phone, }) {
        const checkExist = await this.userRepository.findOne({ filter: { email } });
        if (checkExist) {
            throw new domain_exception_js_1.ConflictRequestException("Email exists");
        }
        const user = await this.userRepository.create({
            data: {
                username,
                email,
                password: await (0, security_1.hash)({ plaintext: password }),
                gender,
                phone: await (0, security_1.encryption)(phone),
            },
        });
        await this.sendEmailOtp({ email, subject: email_enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL });
        return user;
    }
    async confirmEmail({ email, otp }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: user_enum_js_1.ProviderEnum.SYSTEM,
                confirmEmail: { $exists: false },
            },
        });
        if (!account) {
            throw new domain_exception_js_1.NotFoundException("invalid acccount");
        }
        const hashOtp = await this.cachService.get({
            key: (0, send_email_js_1.userEmailKey)({ email, subject: email_enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL }),
        });
        if (!hashOtp || !(await (0, security_1.compare)(otp, hashOtp))) {
            throw new domain_exception_js_1.BadRequestException("invalid otp");
        }
        account.confirmEmail = new Date();
        await account.save();
        await this.cachService.del({
            key: await this.cachService.keys({
                prefix: (0, send_email_js_1.userEmailKey)({
                    email,
                    subject: email_enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL,
                }),
            }),
        });
        return;
    }
    async sendEmailOtp({ email, subject = email_enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL, expiresIn = 120, maxTrials = 3, blockSeconds = 300, }) {
        const existOtpTtl = await this.cachService.ttl({
            key: (0, send_email_js_1.userEmailKey)({ email, subject }),
        });
        if (existOtpTtl > 0) {
            throw new domain_exception_js_1.ConflictRequestException(`sorry we canno0t request new otp while existing one is valid try again in ${existOtpTtl}s`);
        }
        let currentTrials = (await this.cachService.get({
            key: (0, send_email_js_1.userEmailOtpTrialsKey)({ email, subject }),
        })) ?? 0;
        if (currentTrials >= maxTrials) {
            throw new domain_exception_js_1.TooManyRequestException(`we have reached otp limit`);
        }
        const otp = (0, otp_js_1.createNumberOtp)();
        await this.cachService.set({
            key: (0, send_email_js_1.userEmailKey)({ email, subject }),
            value: await (0, security_1.hash)({ plaintext: otp.toString() }),
            ttl: expiresIn,
        });
        const finalTrials = await this.cachService.incrBy({
            key: (0, send_email_js_1.userEmailOtpTrialsKey)({ email, subject }),
        });
        if (finalTrials == 3) {
            await this.cachService.expire({
                key: (0, send_email_js_1.userEmailOtpTrialsKey)({ email, subject }),
                ttl: blockSeconds,
            });
        }
        email_event_js_1.emailEvent.emit("sendEmail", {
            recipient: { to: email },
            subject,
            data: { code: otp },
        });
    }
    async resendConfirmEmail({ email }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: user_enum_js_1.ProviderEnum.SYSTEM,
                confirmEmail: { $exists: false },
            },
        });
        if (!account) {
            throw new domain_exception_js_1.NotFoundException("invalid acccount");
        }
        await this.sendEmailOtp({ email, subject: email_enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL });
        return;
    }
    async requestForgotPassword({ email }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: user_enum_js_1.ProviderEnum.SYSTEM,
                confirmEmail: { $exists: true },
            },
        });
        if (!account) {
            throw new domain_exception_js_1.NotFoundException("invalid acccount");
        }
        await this.sendEmailOtp({ email, subject: email_enum_js_1.EmailSubjectEnum.FORGOT_PASSWORD });
        return;
    }
    ;
    async verifyForgotPassword({ email, otp }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: user_enum_js_1.ProviderEnum.SYSTEM,
                confirmEmail: { $exists: true },
            },
        });
        if (!account) {
            throw new domain_exception_js_1.NotFoundException("invalid acccount");
        }
        const hashOtp = await this.cachService.get({
            key: (0, send_email_js_1.userEmailKey)({ email, subject: email_enum_js_1.EmailSubjectEnum.FORGOT_PASSWORD }),
        });
        if (!hashOtp || !(await (0, security_1.compare)(otp, hashOtp))) {
            throw new domain_exception_js_1.BadRequestException("invalid otp");
        }
        return account;
    }
    ;
    async resetForgotPassword({ email, otp, password }) {
        const account = await this.verifyForgotPassword({ email, otp });
        account.password = await (0, security_1.hash)({ plaintext: password });
        account.changeCredentialsTime = new Date();
        await account.save();
        const result = await Promise.all([
            this.cachService.keys({
                prefix: (0, send_email_js_1.userEmailKey)({
                    email,
                    subject: email_enum_js_1.EmailSubjectEnum.FORGOT_PASSWORD,
                }),
            }),
            this.cachService.keys({ prefix: this.tokenService.userBaseRevokeTokenKey({ userId: account._id }) }),
        ]);
        await this.cachService.del({ key: [...result[0], ...result[1]] });
        return;
    }
    ;
    async enableTwoStepVerification({ email }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: user_enum_js_1.ProviderEnum.SYSTEM,
                twoStepVerification: false,
            },
        });
        if (!account) {
            throw new domain_exception_js_1.NotFoundException("invalid acccount");
        }
        if (account.twoStepVerification) {
            throw new domain_exception_js_1.ConflictRequestException("Two-step verification is already enabled");
        }
        await this.sendEmailOtp({
            email,
            subject: email_enum_js_1.EmailSubjectEnum.TWO_STEP_VERIFICATION,
        });
        return;
    }
    ;
    async verifyTwoStepVerification({ email, otp }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: user_enum_js_1.ProviderEnum.SYSTEM,
                confirmEmail: { $exists: true },
            },
        });
        if (!account) {
            throw new domain_exception_js_1.NotFoundException("Invalid account");
        }
        if (account.twoStepVerification) {
            throw new domain_exception_js_1.ConflictRequestException("Two-step verification is already enabled");
        }
        const otpKey = (0, send_email_js_1.userEmailKey)({
            email,
            subject: email_enum_js_1.EmailSubjectEnum.TWO_STEP_VERIFICATION,
        });
        const hashOtp = await this.cachService.get({
            key: otpKey,
        });
        if (!hashOtp || !(await (0, security_1.compare)(otp, hashOtp))) {
            throw new domain_exception_js_1.BadRequestException("Invalid OTP");
        }
        account.twoStepVerification = true;
        await account.save();
        await this.cachService.del({
            key: await this.cachService.keys({
                prefix: otpKey,
            }),
        });
        return {
            message: "Two-step verification enabled successfully",
        };
    }
    ;
    async confirmLogin({ email, otp }, issuer) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: user_enum_js_1.ProviderEnum.SYSTEM,
                confirmEmail: { $exists: true },
                twoStepVerification: true,
            },
        });
        if (!account) {
            throw new domain_exception_js_1.NotFoundException("Invalid account");
        }
        const otpKey = (0, send_email_js_1.userEmailKey)({
            email,
            subject: email_enum_js_1.EmailSubjectEnum.TWO_STEP_VERIFICATION,
        });
        const hashOtp = await this.cachService.get({
            key: otpKey,
        });
        if (!hashOtp || !(await (0, security_1.compare)(otp, hashOtp))) {
            throw new domain_exception_js_1.BadRequestException("Invalid OTP");
        }
        await this.cachService.del({
            key: await this.cachService.keys({
                prefix: otpKey,
            }),
        });
        account.phone = await (0, security_1.decryption)(account.phone);
        return await this.tokenService.createLoginCredentials({
            user: account,
            issuer,
        });
    }
    ;
    async login({ email, password }, issuer) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: user_enum_js_1.ProviderEnum.SYSTEM,
                confirmEmail: { $exists: true },
            },
        });
        if (!account) {
            throw new domain_exception_js_1.NotFoundException("Invalid email or password");
        }
        const match = await (0, security_1.compare)(password, account.password);
        if (!match) {
            throw new domain_exception_js_1.NotFoundException("Invalid email or password");
        }
        if (account.twoStepVerification) {
            await this.sendEmailOtp({
                email,
                subject: email_enum_js_1.EmailSubjectEnum.TWO_STEP_VERIFICATION,
            });
            return { twoStepRequired: true };
        }
        account.phone = await (0, security_1.decryption)(account.phone);
        return await this.tokenService.createLoginCredentials({
            user: account,
            issuer,
        });
    }
}
exports.AuthenticationService = AuthenticationService;
exports.default = new AuthenticationService();
