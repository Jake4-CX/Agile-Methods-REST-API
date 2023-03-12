import { NextFunction, Request, Response } from "express"
var createError = require('http-errors');
import { AppDataSource } from "../data-source";
import { Reports } from "../entity/Reports";
import { ReportVotes } from "../entity/ReportVotes";
import { Users } from "../entity/Users";

export class ReportVoteController {

  private reportVoteRepository = AppDataSource.getRepository(ReportVotes)
  private reportRepository = AppDataSource.getRepository(Reports)

  async create_report_vote(request: Request, response: Response, next: NextFunction) {
    let { report_uuid, vote_type } = request.body;

    const user_id: number = request.user_data.id

    let report = await this.reportRepository.findOneBy({ report_uuid: report_uuid })
    if (!report) return next(createError(401, "Report does not exist"));

    const report_vote_check = await this.reportVoteRepository.findOneBy({ report: {id: report.id }, user: user_id })

    if (report_vote_check) return next(createError(401, "The user has already voted on this report"));

    const report_vote = await this.reportVoteRepository.save(
      Object.assign(new ReportVotes(), {
        report: report.id,
        user: user_id,
        vote_type: (vote_type === "upvote" ? 1 : -1)
      } as ReportVotes)
    )

    if (!report_vote) return next(createError(401, "Failed to vote on report")); // report vote couldn't be created

    return {message: "This vote has been created successfully"};
  }

  async delete_report_vote(request: Request, response: Response, next: NextFunction) {
    const report_uuid = request.params.report_uuid

    const user_id: number = request.user_data.id

    let report = await this.reportRepository.findOneBy({ report_uuid: report_uuid })
    if (!report) return next(createError(401, "Report does not exist"));

    let report_vote = await this.reportVoteRepository.findOneBy({ report: {id: report.id }, user: user_id })

    if (!report_vote) return next(createError(401, "report vote does not exist"));

    const delete_vote = await this.reportVoteRepository.remove(report_vote)

    return delete_vote ? {message: "This vote has been deleted successfully"} : next(createError(401, "Failed to delete report vote"));
  }

  async update_report_vote(request: Request, response: Response, next: NextFunction) {
    const report_uuid = request.params.report_uuid
    const { vote_type } = request.body;

    const user_id: number = request.user_data.id

    let report = await this.reportRepository.findOneBy({ report_uuid: report_uuid })
    if (!report) return next(createError(401, "Report does not exist"));

    let report_vote = await this.reportVoteRepository.findOneBy({ report: {id: report.id }, user: user_id })

    if (!report_vote) return next(createError(401, "report vote does not exist"));

    const update_vote = await this.reportVoteRepository.update(report_vote, { vote_type: (vote_type === "upvote" ? 1 : -1) })

    return update_vote ? {message: "This vote has been updated successfully"} : next(createError(401, "Failed to update report vote"));
  }

  async get_report_votes(request: Request, response: Response, next: NextFunction) {
    const report_uuid = request.params.report_uuid

    const user_id: number = request.user_data.id

    // get report from report_uuid
    let report = await this.reportRepository.findOneBy({ report_uuid: report_uuid })
    if (!report) return next(createError(401, "Report does not exist"));

    let report_votes = await this.reportVoteRepository.find({ where: {report: {id: report.id}}, take: 15 })

    const has_user_voted: boolean = report_votes.filter(report_vote => report_vote.user_id === user_id).length > 0

    return report_votes ? { votes: report_votes, user_voted: has_user_voted } : next(createError(401, "Failed to get report votes"));
  }
}