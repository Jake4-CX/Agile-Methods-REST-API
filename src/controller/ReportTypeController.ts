import { NextFunction, Request, Response } from "express"
var createError = require('http-errors');
import { AppDataSource } from "../data-source";
import { ReportTypes } from "../entity/ReportTypes";

export class ReportTypeController {

  private reportTypeRepository = AppDataSource.getRepository(ReportTypes)

  async add_report_type(request: Request, response: Response, next: NextFunction) {
    let { report_type_name, report_type_description } = request.body;

    const report_type_check = await this.reportTypeRepository.findOne({
      where: { report_type_name }
    })

    if (report_type_check) return next(createError(401, "A report type already exists with this name")); // A report type already exists with this name

    const report_type = await this.reportTypeRepository.save(
      Object.assign(new ReportTypes(), {
        report_type_name,
        report_type_description
      })
    )

    if (!report_type) return next(createError(401, "The report type couldn't be created")); // report type couldn't be created

    return {message: "This type has been created successfully"};
  }

  async delete_report_type(request: Request, response: Response, next: NextFunction) {
    let { report_type_id } = request.params;

    const report_type = await this.reportTypeRepository.delete(report_type_id);

    if (!report_type) return next(createError(401, "The report type couldn't be deleted")); // report type couldn't be deleted

    return {message: "This type has been deleted successfully"};
  }

  async update_report_type(request: Request, response: Response, next: NextFunction) {
    let { report_type_id } = request.params;
    let { report_type_name, report_type_description } = request.body;

    const report_type = await this.reportTypeRepository.update(report_type_id, {
      report_type_name,
      report_type_description
    });

    if (!report_type) return next(createError(401, "This report type couldn't be updated")); // report type couldn't be updated

    return {message: "This type has been updated successfully"};
  }


}