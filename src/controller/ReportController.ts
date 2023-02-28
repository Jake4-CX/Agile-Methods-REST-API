import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express"
import { Reports } from "../entity/Reports";
var createError = require('http-errors');
import { v4 as uuidv4 } from 'uuid';
import { ImageGroupController } from "./ImageGroupController";
import { ImageGroups } from "../entity/ImageGroups";

export class ReportController {

  private reportRepository = AppDataSource.getRepository(Reports)

  async get_all_reports(request: Request, response: Response, next: NextFunction) {
    const reports: Reports[] = await this.reportRepository.find({
      order: {
        report_date: "DESC"
      }
    });

    return reports;
  }

  async get_report_from_uuid(request: Request, response: Response, next: NextFunction) {
    let { report_uuid } = request.params;

    const report: Reports = await this.reportRepository.findOne({
      where: { report_uuid }
    })

    if (!report) return next(createError(401, "A report couldn't be found that has the given report_uuid")); // A report does not exist with this UUID

    return report;


  }

  async get_reports_from_user_id(request: Request, response: Response, next: NextFunction) {
    let { user_id } = request.params;

    const reports: Reports[] = await this.reportRepository.query(`SELECT * FROM reports WHERE user_id = ${user_id}`);

    if (reports.length == 0) return next(createError(401, "A report couldn't be found that has the given user_id")); // A report does not exist with this UUID

    return reports;

  }

  async create_report(request: Request, response: Response, next: NextFunction) {
    let { report_type_id, report_description, report_latitude, report_longitude, report_serverity  } = request.body;

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
      report_serverity: report_serverity,
      report_status: false,
      image_group: image_group_id,
      user: request.user_data.id
    })

    await this.reportRepository.save(report)

    return report;
  }

}