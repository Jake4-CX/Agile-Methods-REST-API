import { param, body, checkSchema } from "express-validator";
import { ImageController } from "./controller/ImageController";
import { ReportController } from "./controller/ReportController";
import { ReportTypeController } from "./controller/ReportTypeController";
import { ReportVoteController } from "./controller/ReportVoteController";
import { UserController } from "./controller/UserController"
import { VerificationController } from "./controller/VerificationController";
import { AssignedReportController } from "./controller/AssignedReportController";
import { ReportUpdateController } from "./controller/ReportUpdateController";

export const Routes = [{
    method: "post",
    route: "/users/login",
    controller: UserController,
    action: "login",
    authorization: false,
    allowed_roles: [],
    validation: [
        body('user_email').isEmail().withMessage("user_email must be a valid email"),
        body('user_password').isString().withMessage("user_password must be a string"),
        body('recaptcha_token').isString().withMessage("recaptcha_token must be a string")
    ]
}, {
    method: "post",
    route: "/users/register",
    controller: UserController,
    action: "register",
    authorization: false,
    allowed_roles: [],
    validation: [
        body('user_email').isEmail().withMessage("user_email must be a valid email").notEmpty().withMessage("user_email must not be empty"),
        body('user_password').isString().withMessage("user_password must be a string").notEmpty().withMessage("user_password must not be empty"),
        body('first_name').isString().withMessage("first_name must be a string").notEmpty().withMessage("first_name must not be empty"),
        body('last_name').isString().withMessage("last_name must be a string").notEmpty().withMessage("last_name must not be empty"),
        body('recaptcha_token').isString().withMessage("recaptcha_token must be a string").notEmpty().withMessage("recaptcha_token must not be empty")
    ]
}, {
    method: "get",
    route: "/users/refresh",
    controller: UserController,
    action: "refresh_token",
    authorization: true,
    allowed_roles: [],
    validation: []
}, {
    method: "get",
    route: "/reports/all",
    controller: ReportController,
    action: "get_all_reports",
    authorization: false,
    allowed_roles: [],
    validation: []
}, {
    method: "get",
    route: "/reports/radius/:latitude/:longitude",
    controller: ReportController,
    action: "get_all_reports_within_radius",
    authorization: false,
    allowed_roles: [],
    validation: [
        param('latitude').isFloat().withMessage("latitude must be a float"),
        param('longitude').isFloat().withMessage("longitude must be a float")
    ]
}, {
    method: "get",
    route: "/reports/user/:user_id",
    controller: ReportController,
    action: "get_reports_from_user_id",
    authorization: false,
    allowed_roles: [],
    validation: [
        param('user_id').isInt({ min: 0 }).withMessage("user_id must be a positive integer")
    ]
}, {
    method: "get",
    route: "/reports/uuid/:report_uuid",
    controller: ReportController,
    action: "get_report_from_uuid",
    authorization: false,
    allowed_roles: [],
    validation: [
        param('report_uuid').isUUID().withMessage("report_uuid must be a valid UUID")
    ]
}, {
    method: "post",
    route: "/reports/report",
    controller: ReportController,
    action: "create_report",
    authorization: true,
    allowed_roles: [],
    validation: [
        body('report_type_id').isInt({ min: 0 }).withMessage("report_type_id must be a valid integer"),
        body('report_description').isString().withMessage("report_description must be a string").notEmpty().withMessage("report_description must not be empty"),
        body('report_latitude').isFloat().withMessage("report_latitude must be a float").notEmpty().withMessage("report_latitude must not be empty"),
        body('report_longitude').isFloat().withMessage("report_longitude must be a float").notEmpty().withMessage("report_longitude must not be empty"),
        body('report_severity').isInt({ min: 1, max: 10 }).withMessage("report_severity must be a valid integer"),
    ]
}, { // startOf: ReportTypes
    method: "post",
    route: "/reports/options/types",
    controller: ReportTypeController,
    action: "add_report_type",
    authorization: true,
    allowed_roles: ["Administrator"],
    validation: [
        body('report_type_name').isString().withMessage("report_type_name must be a string").notEmpty().withMessage("report_type_name must not be empty"),
        body('report_type_description').isString().withMessage("report_type_description must be a string").notEmpty().withMessage("report_type_description must not be empty"),
        body('report_type_icon').isString().withMessage("report_type_icon must be a string").notEmpty().withMessage("report_type_icon must not be empty"),
    ]
}, {
    method: "patch",
    route: "/reports/options/types/:report_type_id",
    controller: ReportTypeController,
    action: "update_report_type",
    authorization: true,
    allowed_roles: ["Administrator"],
    validation: [
        param('report_type_id').isInt({ min: 0 }).withMessage("report_type_id must be a positive integer"),
        body('report_type_name').isString().withMessage("report_type_name must be a string").notEmpty().withMessage("report_type_name must not be empty"),
        body('report_type_description').isString().withMessage("report_type_description must be a string").notEmpty().withMessage("report_type_description must not be empty"),
        body('report_type_icon').isString().withMessage("report_type_icon must be a string").notEmpty().withMessage("report_type_icon must not be empty"),
    ]
}, {
    method: "delete",
    route: "/reports/options/types/:report_type_id",
    controller: ReportTypeController,
    action: "delete_report_type",
    authorization: true,
    allowed_roles: ["Administrator"],
    validation: [
        param('report_type_id').isInt({ min: 0 }).withMessage("report_type_id must be a positive integer"),
    ]
}, {
    method: "get",
    route: "/reports/options",
    controller: ReportTypeController,
    action: "get_all_report_types",
    authorization: false,
    allowed_roles: [],
    validation: []
}, { // startOf: images
    method: "get",
    route: "/images/:image_group_id",
    controller: ImageController,
    action: "get_images_from_group_id",
    authorization: false,
    allowed_roles: [],
    validation: [
        param('image_group_id').isInt({ min: 0 }).withMessage("image_group_id must be a positive integer")
    ]
}, {
    method: "post",
    route: "/images/upload/:image_group_id",
    controller: ImageController,
    action: "upload_image",
    authorization: true,
    allowed_roles: [],
    validation: [
        param('image_group_id').isInt({ min: 0 }).withMessage("image_group_id must be a positive integer")
    ]
}, { // startOf: reportVotes
    method: "post",
    route: "/reports/uuid/:report_uuid/vote",
    controller: ReportVoteController,
    action: "create_report_vote",
    authorization: true,
    allowed_roles: [],
    validation: [
        param('report_uuid').isUUID().withMessage("report_uuid must be a valid UUID"),
        body('vote_type').isString().withMessage("vote_type must be a string").notEmpty().withMessage("vote_type must not be empty").custom((value) => {
            if (value !== "upvote" && value !== "downvote") {
                throw new Error("vote_type must be either 'upvote' or 'downvote'");
            }
            return true;
        })
    ]
}, {
    method: "delete",
    route: "/reports/uuid/:report_uuid/vote",
    controller: ReportVoteController,
    action: "delete_report_vote",
    authorization: true,
    allowed_roles: [],
    validation: [
        param('report_uuid').isUUID().withMessage("report_uuid must be a valid UUID"),
    ]
}, {
    method: "put",
    route: "/reports/uuid/:report_uuid/vote",
    controller: ReportVoteController,
    action: "update_report_vote",
    authorization: true,
    allowed_roles: [],
    validation: [
        param('report_uuid').isUUID().withMessage("report_uuid must be a valid UUID"),
        body('vote_type').isString().withMessage("vote_type must be a string").notEmpty().withMessage("vote_type must not be empty").custom((value) => {
            if (value !== "upvote" && value !== "downvote") {
                throw new Error("vote_type must be either 'upvote' or 'downvote'");
            }
            return true;
        })
    ]
}, {
    method: "get",
    route: "/reports/uuid/:report_uuid/vote",
    controller: ReportVoteController,
    action: "get_report_votes",
    authorization: true,
    allowed_roles: [],
    validation: [
        param('report_uuid').isUUID().withMessage("report_uuid must be a valid UUID"),
    ]
}, { // startOf: resetPassword
    method: "post",
    route: "/users/reset_password",
    controller: VerificationController,
    action: "request_password_reset",
    authorization: false,
    allowed_roles: [],
    validation: [
        body('user_email').isEmail().withMessage("user_email must be a valid email address").notEmpty().withMessage("user_email must not be empty"),
    ],
}, {
    method: "post",
    route: "/users/reset_password/:verification_uuid",
    controller: VerificationController,
    action: "verify_password_reset",
    authorization: false,
    allowed_roles: [],
    validation: [
        body('new_password').isString().withMessage("new_password must be a string").notEmpty().withMessage("new_password must not be empty"),
        param('verification_uuid').isUUID().withMessage("verification_uuid must be a uuid").notEmpty().withMessage("verification_uuid must not be empty"),
    ],
}, {
    method: "get",
    route: "/users/reset_password/:verification_uuid",
    controller: VerificationController,
    action: "check_password_reset",
    authorization: false,
    allowed_roles: [],
    validation: [
        param('verification_uuid').isUUID().withMessage("verification_uuid must be a uuid").notEmpty().withMessage("verification_uuid must not be empty"),
    ],
}, { // startOf: verifyEmail
    method: "get",
    route: "/users/verify_email/:verification_uuid",
    controller: VerificationController,
    action: "verify_email",
    authorization: false,
    allowed_roles: [],
    validation: [
        param('verification_uuid').isUUID().withMessage("verification_uuid must be a uuid").notEmpty().withMessage("verification_uuid must not be empty"),
    ],
}, { // startOf: getUser (Requires Manager+)
    method: "get",
    route: "/users/:user_id",
    controller: UserController,
    action: "get_user",
    authorization: true,
    allowed_roles: ["Manager", "Administrator"],
    validation: [
        param('user_id').isInt({ min: 0 }).withMessage("user_id must be a positive integer"),
    ]
}, {
    method: "patch",
    route: "/users/:user_id/:role_id",
    controller: UserController,
    action: "update_user_role",
    authorization: true,
    allowed_roles: ["Administrator"],
    validation: [
        param('user_id').isInt({ min: 0 }).withMessage("user_id must be a positive integer"),
        param('role_id').isInt({ min: 0 }).withMessage("role_id must be a positive integer"),
    ]
}, {
    method: "get",
    route: "/users",
    controller: UserController,
    action: "get_all_users",
    authorization: true,
    allowed_roles: ["Manager", "Administrator"],
    validation: []
}, { // startOf get_all_unassigned_reports (Requires Manager+)
    method: "get",
    route: "/reports/all/unassigned",
    controller: ReportController,
    action: "get_all_unassigned_reports",
    authorization: true,
    allowed_roles: ["Manager", "Administrator"],
    validation: []
}, {
    method: "get",
    route: "/users/role/:role_id",
    controller: UserController,
    action: "get_all_users_with_role",
    authorization: true,
    allowed_roles: ["Manager", "Administrator"],
    validation: [
        param('role_id').isInt({ min: 0 }).withMessage("role_id must be a positive integer"),
    ]
}, { // Assigning a report to a user
    method: "post",
    route: "/reports/uuid/:report_uuid/assign/",
    controller: AssignedReportController,
    action: "assign_report_to_user",
    authorization: true,
    allowed_roles: ["Manager", "Administrator"],
    validation: [
        param('report_uuid').isUUID().withMessage("report_uuid must be a valid UUID"),
        body('user_id').isInt({ min: 0 }).withMessage("user_id must be a positive integer"),
    ]
}, { // get user's assigned reports (Requires Manager+)
    method: "get",
    route: "/users/:user_id/reports/assigned/unresolved",
    controller: AssignedReportController,
    action: "get_users_uncomplete_assigned_reports",
    authorization: true,
    allowed_roles: ["Manager", "Administrator"],
    validation: [
        param('user_id').isInt({ min: 0 }).withMessage("user_id must be a positive integer"),
    ]
}, {
    method: "get",
    route: "/users/:user_id/reports/assigned",
    controller: AssignedReportController,
    action: "get_users_assigned_reports",
    authorization: true,
    allowed_roles: ["Manager", "Administrator"],
    validation: [
        param('user_id').isInt({ min: 0 }).withMessage("user_id must be a positive integer"),
    ]
}, { // get user's (request senders) assigned reports (Requires Employee+)
    method: "get",
    route: "/reports/assigned",
    controller: AssignedReportController,
    action: "get_user_assigned_reports",
    authorization: true,
    allowed_roles: ["Employee", "Manager", "Administrator"],
    validation: [],
}, { // mark assigned report as complete (Requires Employee+)
    method: "post",
    route: "/reports/uuid/:report_uuid/assigned/complete",
    controller: AssignedReportController,
    action: "mark_assigned_report_complete",
    authorization: true,
    allowed_roles: ["Employee", "Manager", "Administrator"],
    validation: [
        param('report_uuid').isUUID().withMessage("report_uuid must be a valid UUID"),
    ]
}, { // report updates (getting from report uuid)
    method: "get",
    route: "/reports/uuid/:report_uuid/updates",
    controller: ReportUpdateController,
    action: "get_report_updates_from_report_uuid",
    authorization: false,
    allowed_roles: [],
    validation: [
        param('report_uuid').isUUID().withMessage("report_uuid must be a valid UUID"),
    ]
}, {
    method: "post",
    route: "/reports/uuid/:report_uuid/updates",
    controller: ReportUpdateController,
    action: "create_report_update",
    authorization: true,
    allowed_roles: ["Employee", "Manager", "Administrator"],
    validation: [
        param('report_uuid').isUUID().withMessage("report_uuid must be a valid UUID"),
        body('report_update_text').isString().withMessage("report_update_text must be a string").notEmpty().withMessage("report_update_text must not be empty"),
    ]
}, {
    method: "delete",
    route: "/reports/uuid/:report_uuid",
    controller: ReportController,
    action: "delete_report",
    authorization: true,
    allowed_roles: ["Manager", "Administrator"],
    validation: [
        param('report_uuid').isUUID().withMessage("report_uuid must be a valid UUID"),
    ]
}, {
    method: "get",
    route: "/reports/statistics",
    controller: ReportController,
    action: "get_report_statistics",
    authorization: false,
    allowed_roles: [],
    validation: []
}]