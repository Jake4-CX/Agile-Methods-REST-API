import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express"
import { Reports } from "../entity/Reports";
var createError = require('http-errors');
import { v4 as uuidv4 } from 'uuid';
import { ImageGroupController } from "./ImageGroupController";
import { ImageGroups } from "../entity/ImageGroups";
import { Users } from "../entity/Users";
import { ReportVotes } from "../entity/ReportVotes";
import { Images } from "../entity/Images";
import { sendEmail } from "../utils/email";
import * as config from "../config";
import { Addresses } from "../entity/Addresses";
import { coordinatesToAddress } from "../utils/address";
import { AssignedReports } from "../entity/AssignedReports";
import moment = require("moment");

export class ReportController {

  private reportRepository = AppDataSource.getRepository(Reports)
  private reportVoteRepository = AppDataSource.getRepository(ReportVotes)
  private imageRepository = AppDataSource.getRepository(Images)
  private addressesRepository = AppDataSource.getRepository(Addresses)
  private userRepository = AppDataSource.getRepository(Users)

  async get_all_reports(request: Request, response: Response, next: NextFunction) {
    const reports: Reports[] = await this.reportRepository
      .createQueryBuilder('report')
      .orderBy('report_date', 'ASC')
      .leftJoinAndSelect('report.report_type', 'reportType')
      .leftJoinAndSelect('report.image_group', 'imageGroup')
      .leftJoinAndSelect('report.user', 'user')
      .leftJoinAndSelect('report.address', 'address') // Join the address relationship
      .leftJoinAndMapMany(
        "report.report_votes_data",
        ReportVotes,
        "report_vote",
        "report_vote.report = report.id"
      )
      .leftJoinAndSelect("report.report_images", "image")
      .getMany();

    for (let report of reports) {

      if (report.report_votes_data) {
        report.report_votes = {
          upvotes: report.report_votes_data.filter((report_vote) => report_vote.vote_type == 1).length,
          downvotes: report.report_votes_data.filter((report_vote) => report_vote.vote_type == -1).length
        }

        delete report.report_votes_data
      }

      // Remove the user password and email from the report object
      delete report.user.user_password
      delete report.user.user_email
      delete report.user.last_name
    }

    return reports;
  }

  async get_all_reports_within_radius(request: Request, response: Response, next: NextFunction) {
    let { latitude, longitude } = request.params;

    const radius = 15; // 15 miles

    const reports: Reports[] = await this.reportRepository
      .createQueryBuilder('report')
      .addSelect(`(ST_Distance_Sphere(POINT(${latitude}, ${longitude}), POINT(address.address_latitude, address.address_longitude)) / 1609.34)`, `report_distance`)
      .having(`report_distance < :radius`, { radius })
      .orderBy('report_distance', 'ASC')
      .leftJoinAndSelect('report.report_type', 'reportType')
      .leftJoinAndSelect('report.image_group', 'imageGroup')
      .leftJoinAndSelect('report.user', 'user')
      .leftJoinAndSelect('report.address', 'address') // Join the address relationship
      .leftJoinAndMapMany(
        "report.report_votes_data",
        ReportVotes,
        "report_vote",
        "report_vote.report = report.id"
      )
      .leftJoinAndSelect("report.report_images", "image")
      .getMany();

    for (let report of reports) {

      if (report.report_votes_data) {
        report.report_votes = {
          upvotes: report.report_votes_data.filter((report_vote) => report_vote.vote_type == 1).length,
          downvotes: report.report_votes_data.filter((report_vote) => report_vote.vote_type == -1).length
        }

        delete report.report_votes_data
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

    const report: Reports = await this.reportRepository
      .createQueryBuilder('report')
      .where('report.report_uuid = :report_uuid', { report_uuid })
      .leftJoinAndSelect('report.report_type', 'reportType')
      .leftJoinAndSelect('report.image_group', 'imageGroup')
      .leftJoinAndSelect('report.user', 'user')
      .leftJoinAndSelect('report.address', 'address') // Join the address relationship
      .leftJoinAndMapMany(
        "report.report_votes_data",
        ReportVotes,
        "report_vote",
        "report_vote.report = report.id"
      )
      .leftJoinAndSelect("report.report_images", "image")
      .getOne();


    if (report.report_votes_data) {
      report.report_votes = {
        upvotes: report.report_votes_data.filter((report_vote) => report_vote.vote_type == 1).length,
        downvotes: report.report_votes_data.filter((report_vote) => report_vote.vote_type == -1).length
      }

      delete report.report_votes_data
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




    const reports: Reports[] = await this.reportRepository
      .createQueryBuilder('report')
      .where('report.user = :user_id', { user_id })
      .leftJoinAndSelect('report.report_type', 'reportType')
      .leftJoinAndSelect('report.image_group', 'imageGroup')
      .leftJoinAndSelect('report.user', 'user')
      .leftJoinAndSelect('report.address', 'address') // Join the address relationship
      .leftJoinAndMapMany(
        "report.report_votes_data",
        ReportVotes,
        "report_vote",
        "report_vote.report = report.id"
      )
      .leftJoinAndSelect("report.report_images", "image")
      .getMany();

    for (let report of reports) {

      if (report.report_votes_data) {
        report.report_votes = {
          upvotes: report.report_votes_data.filter((report_vote) => report_vote.vote_type == 1).length,
          downvotes: report.report_votes_data.filter((report_vote) => report_vote.vote_type == -1).length
        }

        delete report.report_votes_data
      }

      // Remove the user password and email from the report object
      delete report.user.user_password
      delete report.user.user_email
      delete report.user.last_name
    }

    if (reports.length == 0) return next(createError(401, "A report couldn't be found that has the given user_id")); // A report does not exist with this UUID

    return reports;

  }

  async create_report(request: Request, response: Response, next: NextFunction) {
    let { report_type_id, report_description, report_latitude, report_longitude, report_severity } = request.body;

    const report_uuid = uuidv4();

    // Create image group for the user, and get the image group id
    const image_group_id = await ImageGroupController.imageGroupRepository.save(
      Object.assign(new ImageGroups(), {
        user: request.user_data.id
      })
    )

    if (!image_group_id) return next(createError(401, "An image group couldn't be created for the report")); // An image group couldn't be created for the report

    let address = Object.assign(new Addresses(), {
      address_latitude: report_latitude,
      address_longitude: report_longitude,
    });

    const addrData = await coordinatesToAddress(report_latitude, report_longitude)

    if (addrData) {
      address = addrData;
    }

    address = await this.addressesRepository.save(address);

    const report: Reports = Object.assign(new Reports(), {
      report_uuid: report_uuid,
      report_type: report_type_id,
      report_description: report_description,
      report_latitude: report_latitude,
      report_longitude: report_longitude,
      report_severity: report_severity,
      report_status: false,
      image_group: image_group_id,
      user: request.user_data.id,
      address: address
    })

    const resp = await this.reportRepository.save(report)

    if (!resp) return next(createError(401, "A report couldn't be created")); // A report couldn't be created

    const userData = await this.userRepository.findOne({
      where: { id: request.user_data.id },
    });

    await sendEmail(userData.user_email, "Report Created", `Your <a href='${config.site_base_url}/reports/${report.report_uuid}'>report</a> has been created successfully`);

    return report;
  }

  async get_all_unassigned_reports(request: Request, response: Response, next: NextFunction) {

    const reports: Reports[] = await this.reportRepository
      .createQueryBuilder('report')
      .where('report.report_status = :report_status', { report_status: false })
      .leftJoinAndSelect('report.report_type', 'reportType')
      .leftJoinAndSelect('report.image_group', 'imageGroup')
      .leftJoinAndSelect('report.user', 'user')
      .leftJoinAndSelect('report.address', 'address') // Join the address relationship
      .leftJoinAndMapMany(
        "report.report_votes_data",
        ReportVotes,
        "report_vote",
        "report_vote.report = report.id"
      )
      .leftJoinAndMapOne(
        "report.assigned_report",
        AssignedReports,
        "assigned_report",
        "assigned_report.report = report.id",

      )
      .leftJoinAndSelect("report.report_images", "image")
      .andWhere('assigned_report.id IS NULL')
      .orderBy('report.report_date', 'DESC')
      .getMany();

    for (let report of reports) {

      if (report.report_votes_data) {
        report.report_votes = {
          upvotes: report.report_votes_data.filter((report_vote) => report_vote.vote_type == 1).length,
          downvotes: report.report_votes_data.filter((report_vote) => report_vote.vote_type == -1).length
        }

        delete report.report_votes_data
      }

      // Remove the user password and email from the report object
      delete report.user.user_password
      delete report.user.user_email
      delete report.user.last_name
    }

    return reports;

  }

  async delete_report(request: Request, response: Response, next: NextFunction) {
    let { report_uuid } = request.params;

    const report = await this.reportRepository.findOne({
      where: { report_uuid: report_uuid },
    });

    if (!report) return next(createError(401, "A report couldn't be found that has the given report_id")); // A report does not exist with this UUID

    await this.reportRepository.delete(report);

    return { message: "Report deleted successfully" };
  }

  async get_report_statistics(request: Request, response: Response, next: NextFunction) {
    // Return these values: Reports submitted in the last week, Reports completed in the last week & total reports submitted

    const reports_submitted_last_week = await this.reportRepository
      .createQueryBuilder('report')
      .where('report.report_date >= :report_date', { report_date: moment().subtract(7, 'days').toDate() })
      .getCount();

    const reports_completed_last_week = await this.reportRepository
      .createQueryBuilder('report')
      .where('report.report_date >= :report_date', { report_date: moment().subtract(7, 'days').toDate() })
      .andWhere('report.report_status = :report_status', { report_status: true })
      .getCount();

    const total_reports_submitted = await this.reportRepository
      .createQueryBuilder('report')
      .getCount();

    return {
      reports_submitted_last_week: reports_submitted_last_week,
      reports_completed_last_week: reports_completed_last_week,
      total_reports_submitted: total_reports_submitted
    }
  }

}