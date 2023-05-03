import { AppDataSource } from '../data-source'
import { NextFunction, Request, Response } from "express"
import { Users } from "../entity/Users"
import { verify, sign } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokens } from '../entity/RefreshTokens';
import axios from 'axios';
import { Verification } from '../entity/Verification';
import { sendEmail } from '../utils/email';
const bcrypt = require('bcrypt');
var createError = require('http-errors');
import * as config from '../config';
import { Reports } from '../entity/Reports';
import { AssignedReports } from '../entity/AssignedReports';
import { AccountRoles } from '../entity/AccountRoles';

export class UserController {

	private userRepository = AppDataSource.getRepository(Users)
	private accountRoleRepository = AppDataSource.getRepository(AccountRoles)
	private refreshTokenRepository = AppDataSource.getRepository(RefreshTokens)
	private verificationRepository = AppDataSource.getRepository(Verification)

	async remove(request: Request, response: Response, next: NextFunction) {
		const id = parseInt(request.params.id)

		let userToRemove = await this.userRepository.findOneBy({ id })
		if (!userToRemove) return next(createError(401, "user does not exist"));

		await this.userRepository.remove(userToRemove)
	}

	async login(request: Request, response: Response, next: NextFunction) {
		const { user_email, user_password, recaptcha_token } = request.body;

		// Verify recaptcha_token - google docs for recaptcha v2 informs users to POST the paramaters, but for some reason this doesn't work   
		const recaptchaVerifyResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${config.recaptcha_secret_key}&response=${recaptcha_token}`);

		if (!recaptchaVerifyResponse.data.success) {
			return next(createError(401, "reCAPTCHA verification failed!"));
		}

		const user: Users = await this.userRepository.findOne({
			where: { user_email },
			relations: ["account_role", "address"]
		});

		if (!user) return next(createError(401, "Invalid Email or Password!")); // A user does not exist with this email address

		const passwordMatch = await bcrypt.compare(user_password, user.user_password);

		if (!passwordMatch) return next(createError(401, "Invalid Email or Password!")); // Password is incorrect

		delete user.user_password;

		if (user.verified == false) return next(createError(401, "Please verify your email address before logging in."));

		const tokens = await this.createTokens(user)

		if (tokens == null) return next(createError(500, "An error occurred while logging in."));

		return { ...user, tokens: tokens }

	}

	async register(request: Request, response: Response, next: NextFunction) {
		let { user_email, user_password, first_name, last_name, recaptcha_token } = request.body;

		const recaptchaVerifyResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${config.recaptcha_secret_key}&response=${recaptcha_token}`);

		if (!recaptchaVerifyResponse.data.success) {
			return next(createError(401, "reCAPTCHA verification failed!"));
		}

		user_password = await bcrypt.hash(user_password, 10);

		console.log("user_password: " + user_password);

		if (await this.userRepository.findOne({ where: { user_email } }) !== null) {
			return next(createError(401, "An account already exists with this email address"));

		}

		const user_uuid = uuidv4();

		const user = Object.assign(new Users(), {
			user_email: user_email,
			user_password: user_password,
			first_name: first_name,
			last_name: last_name,
			user_uuid: user_uuid,
			account_role: 1
		});

		const db_response: Users = await this.userRepository.save(user);

		enum VerificationType {
			"email_verification" = 1,
			"password_reset" = 2
		}

		// create verification code and store in database

		const verification = Object.assign(new Verification(), {
			verification_uuid: uuidv4(),
			verification_type: VerificationType.email_verification,
			user: db_response
		});

		await this.verificationRepository.save(verification);

		await sendEmail(user_email, "Verify your email address", `Please click the link below to verify your email address: \n\n ${config.site_base_url}/verify/${verification.verification_uuid}`);

		delete db_response.user_password;
		delete db_response.last_login_date;
		delete db_response.registration_date;

		return db_response
	}

	async refresh_token(request: Request, response: Response, next: NextFunction) {
		const token = request.token;

		let tokens: { accessToken: string, refreshToken: string };

		if (verify(token, process.env.JWT_REFRESH_SECRET)) {
			tokens = await this.createTokens(request.user_data as Users)
			if (tokens == null) return next(createError(500, "An error occurred whilst generating tokens."));
		} else {
			return next(createError(401, "This is not a refresh token."));
		}

		return { tokens: tokens }

	}


	async createTokens(user: Users) {
		const accessToken = sign({ id: user.id, email: user.user_email }, process.env.JWT_ACCESS_SECRET, { expiresIn: "30m" });
		const refreshToken = sign({ id: user.id, email: user.user_email }, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });

		const response = await this.refreshTokenRepository.save(Object.assign(new RefreshTokens(), {
			user: user.id,
			refresh_token: refreshToken,
			created_at: new Date(),
			expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000))
		}))

		if (response !== null) return ({ accessToken, refreshToken })

		return null
	}

	async get_user(request: Request, response: Response, next: NextFunction) {
		// const user = await this.userRepository.findOne({
		//     where: { id: request.user_data.id },
		//     relations: ["account_role", "address"]
		// });

		const { user_id } = request.params;

		const user = await this.userRepository
			.createQueryBuilder("user")
			.leftJoinAndSelect("user.address", "address")
			.leftJoinAndSelect("user.account_role", "account_role")
			.leftJoinAndMapMany(
				"user.reports",
				Reports,
				"reports",
				"reports.user_id = user.id"
			)
			.leftJoinAndSelect("reports.report_type", "report_type")
			.where("user.id = :id", { id: user_id })
			.getOne();

		if (!user) return next(createError(401, "User does not exist."));

		delete user.user_password;

		return user
	}

	async get_all_users(request: Request, response: Response, next: NextFunction) {

		const users: Users[] = await this.userRepository
			.createQueryBuilder("user")
			.leftJoinAndSelect("user.address", "address")
			.leftJoinAndSelect("user.account_role", "account_role")
			.leftJoinAndMapMany(
				"user.reports",
				Reports,
				"reports",
				"reports.user_id = user.id"
			)
			.leftJoinAndSelect("reports.report_type", "report_type")
			.getMany();

		if (!users) return next(createError(401, "No users exist."));

		for (let user of users) {
			delete user.user_password;

			user.report_info = {
				total_reports: user.reports.length,
				total_reports_open: user.reports.filter(report => report.report_status == false).length,
				total_reports_closed: user.reports.filter(report => report.report_status == true).length
			}

			delete user.reports;
		}

		return users
	}

	async get_all_users_with_role(request: Request, response: Response, next: NextFunction) {

		const { role_id } = request.params;

		const users: Users[] = await this.userRepository
			.createQueryBuilder("user")
			.leftJoinAndSelect("user.address", "address")
			.leftJoinAndSelect("user.account_role", "account_role")
			.leftJoinAndMapMany(
				"user.assigned_reports",
				AssignedReports,
				"assigned_reports",
				"assigned_reports.user_id = user.id"
			)
			.leftJoinAndSelect("assigned_reports.report", "report")
			.where("account_role.id = :id", { id: role_id })
			.getMany();


		return users;
	}

	async update_user_role(request: Request, response: Response, next: NextFunction) {
		
		const { user_id, role_id } = request.params;

		const user = await this.userRepository.findOne({ where: { id: Number(user_id) } });

		if (!user) return next(createError(401, "User does not exist."));

		user.account_role = await this.accountRoleRepository.findOne({ where: { id: Number(role_id) } });

		if (!user.account_role) return next(createError(401, "Role does not exist."));

		await this.userRepository.save(user);

		return { message: "User role updated successfully."};
	}
}