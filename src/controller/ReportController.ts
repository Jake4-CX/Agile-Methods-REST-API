import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express"
import { Reports } from "../entity/Reports";
var createError = require('http-errors');
import { v4 as uuidv4 } from 'uuid';
import { ImageGroupController } from "./ImageGroupController";
import { ImageGroups } from "../entity/ImageGroups";
import { Users } from "../entity/Users";
import { ReportVotes } from "../entity/ReportVotes";

export class ReportController {

  private reportRepository = AppDataSource.getRepository(Reports)
  private reportVoteRepository = AppDataSource.getRepository(ReportVotes)

  async get_all_reports(request: Request, response: Response, next: NextFunction) {
    const reports: Reports[] = await this.reportRepository.find({
      order: {
        report_date: "DESC"
      },
      relations: ["report_type", "image_group", "user"]
    });

    for (let report of reports) {
      let report_votes = await this.reportVoteRepository.findBy({ report: report.id })

      report.report_votes = {
        upvotes: report_votes.filter((report_vote) => report_vote.vote_type == 1).length,
        downvotes: report_votes.filter((report_vote) => report_vote.vote_type == -1).length
      }

      // Remove the user password and email from the report object
      delete report.user.user_password
      delete report.user.user_email
      delete report.user.last_name
    }

    return reports;
  }

  async get_report_from_uuid(request: Request, response: Response, next: NextFunction) {
    let { report_uuid } = request.params;

    const report: Reports = await this.reportRepository.findOne({
      where: { report_uuid },
      relations: ["report_type", "image_group", "user"]
    })

    if (!report) return next(createError(401, "A report couldn't be found that has the given report_uuid")); // A report does not exist with this UUID

    let report_votes = await this.reportVoteRepository.findBy({ report: report.id })

    report.report_votes = {
      upvotes: report_votes.filter((report_vote) => report_vote.vote_type == 1).length,
      downvotes: report_votes.filter((report_vote) => report_vote.vote_type == -1).length
    }

    // Remove the user password and email from the report object
    delete report.user.user_password
    delete report.user.user_email
    delete report.user.last_name

    return report;


  }

  async get_reports_from_user_id(request: Request, response: Response, next: NextFunction) {
    let { user_id } = request.params;

    const userRepository = AppDataSource.getRepository(Users)
    const user = await userRepository.findOne({ where: { id: parseInt(user_id) } })

    if (!user) return next(createError(401, "A user couldn't be found that has the given user_id")); // A user does not exist with this UUID

    const reports: Reports[] = await this.reportRepository.find({
      where: { user: user },
      relations: ["report_type", "image_group"]
    })

    // Add report votes to each report object

    for (let report of reports) {
      let report_votes = await this.reportVoteRepository.findBy({ report: report.id })

      report.report_votes = {
        upvotes: report_votes.filter((report_vote) => report_vote.vote_type == 1).length,
        downvotes: report_votes.filter((report_vote) => report_vote.vote_type == -1).length
      }
    }

    if (reports.length == 0) return next(createError(401, "A report couldn't be found that has the given user_id")); // A report does not exist with this UUID

    return reports;

  }

  async create_report(request: Request, response: Response, next: NextFunction) {
    let { report_type_id, report_description, report_latitude, report_longitude, report_severity  } = request.body;

    const report_uuid = uuidv4();

    // Create image group for the user, and get the image group id
    const image_group_id = await ImageGroupController.imageGroupRepository.save(
      Object.assign(new ImageGroups(), {
        user: request.user_data.id
      })
    )

    if (!image_group_id) return next(createError(401, "An image group couldn't be created for the report")); // An image group couldn't be created for the report

    const report: Reports = Object.assign(new Reports(), {
      report_uuid: report_uuid,
      report_type: report_type_id,
      report_description: report_description,
      report_latitude: report_latitude,
      report_longitude: report_longitude,
      report_severity: report_severity,
      report_status: false,
      image_group: image_group_id,
      user: request.user_data.id
    })

    await this.reportRepository.save(report)

    return report;
  }

}