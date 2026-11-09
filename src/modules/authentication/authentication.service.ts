import { UserRepository } from "./../../common/repository/user.repository";
import {
  BadRequestException,
  ConflictRequestException,
  NotFoundException,
  TooManyRequestException,
} from "../../common/exception/domain.exception.js";
import {
  confirmEmailDto,
  loginDto,
  resendConfirmEmailDto,
  signupTypeDto,
} from "./dto/authentication.dto";
import {
  cachService,
  CachService,
} from "../../common/service/cashe.service.js";
import { compare, decryption, encryption, hash } from "../../common/security";
import {  ProviderEnum } from "../../common/enum/user.enum.js";
import { EmailSubjectEnum } from "../../common/enum/email.enum.js";
import {
  userEmailKey,
  userEmailOtpTrialsKey,
} from "../../common/utilis/email/send.email.js";
import { emailEvent } from "../../common/utilis/email/email.event.js";
import { createNumberOtp } from "../../common/utilis/email/otp.js";
import { IUser } from "../../common/interface/user.interface.js";
import { tokenService, TokenService } from "../../common/service";
import { ILoginResponse, ISignupWithGmailResponse } from "./entities/authentication.entity.js";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { WEB_CLIENT_IDS } from "../../config.js";
import { HUser } from "../../DB/model/user.model.js";
export class AuthenticationService {
  private userRepository: UserRepository;
  private cachService: CachService;
  private tokenService: TokenService;
  private client: OAuth2Client;
  constructor() {
    this.cachService = cachService;
    this.userRepository = new UserRepository();
    this.tokenService = tokenService;
    this.client = new OAuth2Client();
  }

  async verifyGoogleAccount(idToken: string): Promise<TokenPayload> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: WEB_CLIENT_IDS,
    });
    const payload = ticket.getPayload();
    if (!payload?.email_verified) {
      throw new BadRequestException("Email not verified");
    }
    return payload;
  }

  async signupWithGmail({ idToken }: { idToken: string }, issuer: string):Promise<ISignupWithGmailResponse> {
    const { email, name, picture } = await this.verifyGoogleAccount(idToken);

    const existAccount = await this.userRepository.findOne({
      filter: { email: email as string },
    });
    if (existAccount) {
      if (existAccount.provider != ProviderEnum.GOOGLE) {
        throw new ConflictRequestException("invalid account provider");
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
        provider: ProviderEnum.GOOGLE,
        image: picture,
      },
    });
    return {
      status: 201,
      data: await this.tokenService.createLoginCredentials({ user, issuer }),
    };
  }
  async signup({
    username,
    email,
    password,
    gender,
    phone,
  }: signupTypeDto["body"]): Promise<IUser> {
    const checkExist = await this.userRepository.findOne({ filter: { email } });
    if (checkExist) {
      throw new ConflictRequestException("Email exists");
    }
    const user = await this.userRepository.create({
      data: {
        username,
        email,
        password: await hash({ plaintext: password }),
        gender,
        phone: await encryption(phone),
      },
    });
    await this.sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL });
    return user;
  }

  async confirmEmail({ email, otp }: confirmEmailDto) {
    const account = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
        confirmEmail: { $exists: false },
      },
    });
    if (!account) {
      throw new NotFoundException("invalid acccount");
    }
    const hashOtp = await this.cachService.get({
      key: userEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }),
    });
    if (!hashOtp || !(await compare(otp, hashOtp))) {
      throw new BadRequestException("invalid otp");
    }
    account.confirmEmail = new Date();
    await account.save();
    await this.cachService.del({
      key: await this.cachService.keys({
        prefix: userEmailKey({
          email,
          subject: EmailSubjectEnum.CONFIRM_EMAIL,
        }),
      }),
    });
    return;
  }
  async sendEmailOtp({
    email,
    subject = EmailSubjectEnum.CONFIRM_EMAIL,
    expiresIn = 120,
    maxTrials = 3,
    blockSeconds = 300,
  }: {
    email: string;
    subject: EmailSubjectEnum;
    expiresIn?: number;
    maxTrials?: number;
    blockSeconds?: number;
  }) {
    const existOtpTtl = await this.cachService.ttl({
      key: userEmailKey({ email, subject }),
    });
    if (existOtpTtl > 0) {
      throw new ConflictRequestException(
        `sorry we canno0t request new otp while existing one is valid try again in ${existOtpTtl}s`,
      );
    }
    let currentTrials =
      (await this.cachService.get({
        key: userEmailOtpTrialsKey({ email, subject }),
      })) ?? 0;
    if (currentTrials >= maxTrials) {
      throw new TooManyRequestException(`we have reached otp limit`);
    }
    const otp = createNumberOtp();
    await this.cachService.set({
      key: userEmailKey({ email, subject }),
      value: await hash({ plaintext: otp.toString() }),
      ttl: expiresIn,
    });

    const finalTrials = await this.cachService.incrBy({
      key: userEmailOtpTrialsKey({ email, subject }),
    });

    if (finalTrials == 3) {
      await this.cachService.expire({
        key: userEmailOtpTrialsKey({ email, subject }),
        ttl: blockSeconds,
      });
    }

    emailEvent.emit("sendEmail", {
      recipient: { to: email },
      subject,
      data: { code: otp },
    });
  }
  async resendConfirmEmail({ email }: resendConfirmEmailDto) {
    const account = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
        confirmEmail: { $exists: false },
      },
    });
    if (!account) {
      throw new NotFoundException("invalid acccount");
    }
    await this.sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL });
    return;
  }

  async requestForgotPassword ({ email }:{email:string}) {
  const account = await this.userRepository.findOne({
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: true },
    },
  });
  if (!account) {
    throw new NotFoundException( "invalid acccount" );
  }
  await this.sendEmailOtp({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD });
  return;
};

async verifyForgotPassword  ({ email, otp }:{email:string,otp:number}):Promise<HUser> {
  const account = await this.userRepository.findOne({
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: true },
    },
  });
  if (!account) {
    throw new NotFoundException( "invalid acccount" );
  }
  const hashOtp = await this.cachService.get({
    key: userEmailKey({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD }),
  });
  if (!hashOtp || !(await compare(otp, hashOtp))) {
    throw new BadRequestException( "invalid otp" );
  }
  return account;
};

async resetForgotPassword ({ email, otp, password }:{email:string,otp:number,password:string}) {
  const account = await this.verifyForgotPassword({ email, otp });
  account.password = await hash({ plaintext: password });
  account.changeCredentialsTime = new Date();
  await account.save();
  const result = await Promise.all([
   this.cachService.keys({
      prefix: userEmailKey({
        email,
        subject: EmailSubjectEnum.FORGOT_PASSWORD,
      }),
    }),
    this.cachService.keys({ prefix: this.tokenService.userBaseRevokeTokenKey({ userId: account._id }) }),
  ]);
  await this.cachService.del({ key: [...result[0], ...result[1]] });
  return;
};

async enableTwoStepVerification  ({ email }:{email:string}){
  const account = await this.userRepository.findOne({
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      twoStepVerification: false,
    },
  });
  if (!account) {
    throw new NotFoundException( "invalid acccount" );
  }
  if (account.twoStepVerification) {
    throw new ConflictRequestException( "Two-step verification is already enabled");
  }
  await this.sendEmailOtp({
    email,
    subject: EmailSubjectEnum.TWO_STEP_VERIFICATION,
  });
  return;
};

async verifyTwoStepVerification  ({ email, otp }:{ email:string, otp:number }){
  const account = await this.userRepository.findOne({
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: true },
    },
  });

  if (!account) {
    throw new NotFoundException( "Invalid account");
  }

  if (account.twoStepVerification) {
    throw new ConflictRequestException( "Two-step verification is already enabled");
  }

  const otpKey = userEmailKey({
    email,
    subject: EmailSubjectEnum.TWO_STEP_VERIFICATION,
  });

  const hashOtp = await this.cachService.get({
    key: otpKey,
  });

  if (!hashOtp || !(await compare(otp, hashOtp))) {
    throw new BadRequestException("Invalid OTP");
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
};

async confirmLogin  ({ email, otp }:{ email:string, otp:number }, issuer:string){
  const account = await this.userRepository.findOne({
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: true },
      twoStepVerification: true,
    },
  });
  if (!account) {
    throw new NotFoundException( "Invalid account");
  }
  const otpKey = userEmailKey({
    email,
    subject: EmailSubjectEnum.TWO_STEP_VERIFICATION,
  });

  const hashOtp = await this.cachService.get({
    key: otpKey,
  });
  if (!hashOtp || !(await compare(otp, hashOtp))) {
    throw new BadRequestException( "Invalid OTP");
  }
  await this.cachService.del({
    key: await this.cachService.keys({
      prefix: otpKey,
    }),
  });
  account.phone = await decryption(account.phone as string);
  return await this.tokenService.createLoginCredentials({
    user: account,
    issuer,
  });
};

  async login(
    { email, password }: loginDto,
    issuer: string,
  ): Promise<ILoginResponse | { twoStepRequired: true }> {
    const account = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
        confirmEmail: { $exists: true },
      },
    });

    if (!account) {
      throw new NotFoundException("Invalid email or password");
    }

    const match = await compare(password, account.password as string);

    if (!match) {
      throw new NotFoundException("Invalid email or password");
    }

    if (account.twoStepVerification) {
      await this.sendEmailOtp({
        email,
        subject: EmailSubjectEnum.TWO_STEP_VERIFICATION,
      });
      return { twoStepRequired: true };
    }
    account.phone = await decryption(account.phone as string);

    return await this.tokenService.createLoginCredentials({
      user: account,
      issuer,
    });
  }
}

export default new AuthenticationService();
