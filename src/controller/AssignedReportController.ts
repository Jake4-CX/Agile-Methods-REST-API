import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { AssignedReports } from "../entity/AssignedReports";
import { Users } from "../entity/Users";
var createError = require('http-errors');
import { Reports } from "../entity/Reports";
import { ReportVotes } from "../entity/ReportVotes";
import { sendEmail } from "../utils/email";


export class AssignedReportController {

  private userRepository = AppDataSource.getRepository(Users)
  private reportRepository = AppDataSource.getRepository(Reports)
  private assignedReportRepository = AppDataSource.getRepository(AssignedReports)

  async assign_report_to_user(request: Request, response: Response, next: NextFunction) {

    const { report_uuid } = request.params;
    const { user_id } = request.body;

    const user: Users = await this.userRepository.findOneBy({ id: parseInt(user_id) });

    if (!user) return next(createError(401, "User does not exist."));

    const report = await this.reportRepository.findOneBy({ report_uuid: report_uuid });

    if (!report) return next(createError(401, "Report does not exist."));

    // Check if the report is already assigned to a user

    const assignedReport = await this.assignedReportRepository.findOneBy({ report: report });

    if (assignedReport) return next(createError(401, "This Report is already assigned to a user."));

    // Creating a new AssignedReport object
    const assigned_report = Object.assign(new AssignedReports(), {
      report: report,
      user: user
    });

    const saved_assigned_report = await this.assignedReportRepository.save(assigned_report);

    if (!saved_assigned_report) return next(createError(401, "Failed to assign report to user."));

    return saved_assigned_report;
  }

  async get_users_assigned_reports(request: Request, response: Response, next: NextFunction) {

    const { user_id } = request.params;

    const user: Users = await this.userRepository.findOne({ where: { id: parseInt(user_id) } });

    if (!user) return next(createError(401, "User does not exist."));

    const assigned_reports: AssignedReports[] = await this.assignedReportRepository
      .createQueryBuilder("assigned_report")
      .leftJoinAndSelect("assigned_report.report", "report")
      .leftJoinAndSelect("report.report_type", "report_type")
      .leftJoinAndSelect("report.address", "address")
      .where("assigned_report.user = :id", { id: user.id })
      .getMany();

    return assigned_reports;
  }

  async get_users_uncomplete_assigned_reports(request: Request, response: Response, next: NextFunction) {
    // This is for uncomplete assigned reports

    const { user_id } = request.params;

    const user: Users = await this.userRepository.findOne({ where: { id: parseInt(user_id) } });

    if (!user) return next(createError(401, "User does not exist."));

    const assigned_reports: AssignedReports[] = await this.assignedReportRepository
      .createQueryBuilder("assigned_report")
      .leftJoinAndSelect("assigned_report.report", "report")
      .leftJoinAndSelect("report.report_type", "report_type")
      .leftJoinAndSelect("report.address", "address")
      .where("assigned_report.user = :id", { id: user.id })
      .andWhere("report.report_status = :status", { status: false })
      .getMany();

    return assigned_reports;
  }

  async get_user_assigned_reports(request: Request, response: Response, next: NextFunction) {
    // This is for getting the sender's assigned reports

    const user_id = request.user_data.id;

    const assigned_reports: AssignedReports[] = await this.assignedReportRepository
      .createQueryBuilder("assigned_report")
      .where('assigned_report.user = :user_id', { user_id })
      .andWhere('report.report_status = :report_status', { report_status: false })
      .leftJoinAndSelect("assigned_report.report", "report")
      .leftJoinAndSelect("report.report_type", "report_type")
      .leftJoinAndSelect("report.address", "address")
      .leftJoinAndSelect("report.user", "user")
      .leftJoinAndSelect('report.image_group', 'imageGroup')
      .leftJoinAndSelect("report.report_images", "image")
      .leftJoinAndMapMany(
        "report.report_votes_data",
        ReportVotes,
        "report_vote",
        "report_vote.report = report.id"
      )
      .getMany();

    for (let assignedReport of assigned_reports) {

      assignedReport.report.report_votes = {
        upvotes: assignedReport.report.report_votes_data.filter((report_vote) => report_vote.vote_type == 1).length,
        downvotes: assignedReport.report.report_votes_data.filter((report_vote) => report_vote.vote_type == -1).length
      }

      delete assignedReport.report.user.user_password;
    }

    return assigned_reports;

  }

  async mark_assigned_report_complete(request: Request, response: Response, next: NextFunction) {

    const { report_uuid } = request.params;

    const report = await this.reportRepository.findOne({ where: { report_uuid: report_uuid }, relations: ["user"]});

    if (!report) return next(createError(401, "Report does not exist."));

    console.log(report);

    const assigned_report = await this.assignedReportRepository.findOne({ where: { report: report }, relations: ["report", "user"] });

    if (!assigned_report) return next(createError(401, "This Report is not assigned to a user."));

    if (assigned_report.report.report_status) return next(createError(401, "This Report is already marked as complete."))

    if (assigned_report.user.id != request.user_data.id || request.user_data.account_role > 2) return next(createError(401, "You are not authorized to mark this report as complete."))

    assigned_report.report.report_status = true;

    const saved_report = await this.reportRepository.save(assigned_report.report);

    sendEmail(report.user.user_email, `Report Complete`, `Your report that was submitted on ${report.report_date} has been marked as complete.`);

    if (!saved_report) return next(createError(401, "Failed to mark report as complete."));

    return saved_report;
  }

}