import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Users } from "../entity/Users";
import { Verification } from "../entity/Verification";
var createError = require('http-errors');
import { sendEmail } from "../utils/email";
import { v4 as uuidv4 } from 'uuid';
import * as config from "../config";
import bcrypt = require('bcrypt');

export class VerificationController {

  private verificationRepository = AppDataSource.getRepository(Verification)
  private userRepository = AppDataSource.getRepository(Users)


  async verify_email(request: Request, response: Response, next: NextFunction) {

    const { verification_uuid } = request.params;

    const verification: Verification = await this.verificationRepository.findOne({
      where: { verification_uuid },
      relations: ["user"]
    })

    if (!verification) return next(createError(401, "A verification couldn't be found that has the given verification_uuid")); // A verification does not exist with this UUID

    if (verification.user.verified) return next(createError(401, "This user has already been verified")); // This user has already been verified

    // Set the user's verified status to true
    verification.user.verified = true;
    await this.userRepository.save(verification.user)

    // Delete the verification
    await this.verificationRepository.delete(verification)

    return {
      message: "User has been verified"
    }

  }

  async verify_password_reset(request: Request, response: Response, next: NextFunction) {

    const { verification_uuid } = request.params;
    let { new_password } = request.body;

    const verification: Verification = await this.verificationRepository.findOne({
      where: { verification_uuid },
      relations: ["user"]
    })

    if (!verification) return next(createError(401, "A verification couldn't be found that has the given verification_uuid")); // A verification does not exist with this UUID

    if (verification.verification_type !== VerificationType.password_reset) return next(createError(401, "This verification is not for a password reset")); // This verification is not for a password reset

    if (await bcrypt.compare(new_password, verification.user.user_password)) return next(createError(401, "The new password is the same as the old password")); // The new password is the same as the old password

    // Set the user's password to the new password

    new_password = await bcrypt.hash(new_password, 10);

    verification.user.user_password = new_password;

    await this.userRepository.save(verification.user)

    // Delete the verification
    await this.verificationRepository.delete(verification)

    return {
      message: "Password has been reset"
    }
  }

  async request_password_reset(request: Request, response: Response, next: NextFunction) {

    const { user_email } = request.body;

    const user: Users = await this.userRepository.findOne({
      where: { user_email: user_email }
    })

    if (!user) return next(createError(401, "A user couldn't be found that has the given email")); // A user does not exist with this email

    // Delete any existing password_reset verifications for this user

    await this.verificationRepository.delete({
      verification_type: VerificationType.password_reset,
      user: user
    });

    // Create a new verification
    const verification = Object.assign(new Verification(), {
      verification_uuid: uuidv4(),
      verification_type: VerificationType.password_reset,
      user: user
    });

    await this.verificationRepository.save(verification)

    // Send an email to the user with a link to reset their password
    sendEmail(user.user_email, 'Reset Password', `<a href="${config.site_base_url}/reset/${verification.verification_uuid}">Click here to reset your password</a>`)

    return {
      message: "A password reset email has been sent to the user"
    }
  }

  async check_password_reset(request: Request, response: Response, next: NextFunction) {

    const { verification_uuid } = request.params;

    const verification: Verification = await this.verificationRepository.findOne({
      where: { verification_uuid },
      relations: ["user"]
    })

    if (!verification) return next(createError(401, "A verification couldn't be found that has the given verification_uuid")); // A verification does not exist with this UUID

    if (verification.verification_type !== VerificationType.password_reset) return next(createError(401, "This verification is not for a password reset")); // This verification is not for a password reset

    return {
      message: "This verification is for a password reset"
    }
  }
}

enum VerificationType {
  "email_verification" = 1,
  "password_reset" = 2
}
