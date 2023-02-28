import { param, body } from "express-validator";
import { ReportController } from "./controller/ReportController";
import { ReportTypeController } from "./controller/ReportTypeController";
import { UserController } from "./controller/UserController"

export const Routes = [{
    method: "get",
    route: "/users",
    controller: UserController,
    action: "all",
    authorization: true,
    allowed_roles: [],
    validation: [],
}, {
    method: "get",
    route: "/users/:id",
    controller: UserController,
    action: "one",
    authorization: true,
    allowed_roles: [],
    validation: [
        param('id').isInt({min: 0}).withMessage("id must be a positive integer"),
    ]
}, {
    method: "delete",
    route: "/users/:id",
    controller: UserController,
    action: "remove",
    authorization: false,
    allowed_roles: ["admin"],
    validation: [
        param('id').isInt({min: 0}).withMessage("id must be a positive integer"),
    ]
}, {
    method: "post",
    route: "/users/login",
    controller: UserController,
    action: "login",
    authorization: false,
    allowed_roles: [],
    validation: [
        body('user_email').isEmail().withMessage("user_email must be a valid email"),
        body('user_password').isString().withMessage("user_password must be a string")
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
    ]
}, {
    method: "get",
    route: "/reports/all",
    controller: ReportController,
    action: "get_all_reports",
    authorization: true,
    allowed_roles: [],
    validation: []
}, {
    method: "get",
    route: "/reports/user/:user_id",
    controller: ReportController,
    action: "get_reports_from_user_id",
    authorization: true,
    allowed_roles: [],
    validation: [
        param('user_id').isInt({min: 0}).withMessage("user_id must be a positive integer")
    ]
}, {
    method: "get",
    route: "/reports/uuid/:report_uuid",
    controller: ReportController,
    action: "get_report_from_uuid",
    authorization: true,
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
        body('report_type_id').isInt({min: 0}).withMessage("report_type_id must be a valid integer"),
        body('report_description').isString().withMessage("report_description must be a string").notEmpty().withMessage("report_description must not be empty"),
        body('report_latitude').isFloat().withMessage("report_latitude must be a float").notEmpty().withMessage("report_latitude must not be empty"),
        body('report_longitude').isFloat().withMessage("report_longitude must be a float").notEmpty().withMessage("report_longitude must not be empty"),
        body('report_serverity').isInt({min: 1, max: 10}).withMessage("report_serverity must be a valid integer"),
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
    ]
}, {
    method: "patch",
    route: "/reports/options/types/:report_type_id",
    controller: ReportTypeController,
    action: "update_report_type",
    authorization: true,
    allowed_roles: ["Administrator"],
    validation: [
        param('report_type_id').isInt({min: 0}).withMessage("report_type_id must be a positive integer"),
        body('report_type_name').isString().withMessage("report_type_name must be a string").notEmpty().withMessage("report_type_name must not be empty"),
        body('report_type_description').isString().withMessage("report_type_description must be a string").notEmpty().withMessage("report_type_description must not be empty"),
    ]
}, {
    method: "delete",
    route: "/reports/options/types/:report_type_id",
    controller: ReportTypeController,
    action: "delete_report_type",
    authorization: true,
    allowed_roles: ["Administrator"],
    validation: [
        param('report_type_id').isInt({min: 0}).withMessage("report_type_id must be a positive integer"),
    ]
}, {
    method: "get",
    route: "/reports/options",
    controller: ReportTypeController,
    action: "get_all_report_types",
    authorization: true,
    allowed_roles: [],
    validation: []
}]