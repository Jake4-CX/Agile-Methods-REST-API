import "reflect-metadata"
import { DataSource } from "typeorm"
import { AccountRoles } from "./entity/AccountRoles"
import { AssignedReports } from "./entity/AssignedReports"
import { ImageGroups } from "./entity/ImageGroups"
import { Images } from "./entity/Images"
import { Reports } from "./entity/Reports"
import { ReportTypes } from "./entity/ReportTypes"
import { ReportUpdates } from "./entity/ReportUpdates"
import { Users } from "./entity/Users"
import { Verification } from "./entity/Verification"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "4*CMgmdI6uv@",
    database: "postgres",
    synchronize: true,
    logging: false,
    entities: [Users, AccountRoles, Verification, Reports, ReportTypes, ReportUpdates, AssignedReports, ImageGroups, Images],
    migrations: [],
    subscribers: [],
})
