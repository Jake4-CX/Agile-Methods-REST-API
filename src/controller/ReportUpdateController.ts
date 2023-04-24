import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { ReportUpdates } from "../entity/ReportUpdates";
import { Reports } from "../entity/Reports";
import { Users } from "../entity/Users";
import { ImageGroupController } from "./ImageGroupController";
import { ImageGroups } from "../entity/ImageGroups";
var createError = require('http-errors');

export class ReportUpdateController {

  private userRepository = AppDataSource.getRepository(Users)
  private reportRepository = AppDataSource.getRepository(Reports)
  private reportUpdateRepository = AppDataSource.getRepository(ReportUpdates)
  private imageGroupRepository = AppDataSource.getRepository(ImageGroups)

  async get_report_updates_from_report_uuid(request: Request, response: Response, next: NextFunction) {

    const { report_uuid } = request.params;

    const report = await this.reportRepository.findOneBy({ report_uuid: report_uuid });

    if (!report) return next(createError(401, "Report does not exist."));

    const report_updates: ReportUpdates[] = await this.reportUpdateRepository
      .createQueryBuilder("report_update")
      .leftJoinAndSelect("report_update.report", "report")
      .leftJoinAndSelect("report_update.user", "user")
      .leftJoinAndSelect('report_update.image_group', 'imageGroup')
      // .leftJoinAndSelect("report_update.update_images", "image")
      .where("report.report_uuid = :report_uuid", { report_uuid: report_uuid })
      .orderBy("report_update.report_date", "DESC")
      .getMany();
    
    for (let reportUpdate of report_updates) {
      delete reportUpdate.user.user_password;
    }

    return report_updates;
  }

  async create_report_update(request: Request, response: Response, next: NextFunction) {

    const { report_uuid } = request.params;
    const { report_update_text } = request.body;

    const user_id = request.user_data.id;

    const user: Users = await this.userRepository.findOneBy({ id: parseInt(user_id) });

    if (!user) return next(createError(401, "User does not exist."));

    const report = await this.reportRepository.findOneBy({ report_uuid: report_uuid });

    if (!report) return next(createError(401, "Report does not exist."));

    // Create the image group

    // Create image group for the user, and get the image group id
    const image_group = await this.imageGroupRepository.save(
      Object.assign(new ImageGroups(), {
        user: request.user_data.id
      })
    )

    if (!image_group) return next(createError(401, "An image group couldn't be created for the report")); // An image group couldn't be created for the report

    // Creating a new ReportUpdate object
    const report_update = Object.assign(new ReportUpdates(), {
      report: report,
      user: user,
      report_update_text: report_update_text,
      image_group: image_group
    });

    const saved_report_update = await this.reportUpdateRepository.save(report_update);

    if (!saved_report_update) return next(createError(401, "Failed to create report update."));

    return saved_report_update;
  }
}