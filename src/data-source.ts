import "reflect-metadata"
import { DataSource } from "typeorm"
import { SnakeNamingStrategy } from "typeorm-naming-strategies"
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
    type: "mariadb",
    host: "localhost",
    port: 3306,
    username: "council_user",
    password: "4*CMgmdI6uv@",
    database: "Reports",
    synchronize: true,
    logging: false,
    entities: [Users, AccountRoles, Verification, Reports, ReportTypes, ReportUpdates, AssignedReports, ImageGroups, Images],
    migrations: [],
    subscribers: [],
    namingStrategy: new SnakeNamingStrategy(),
})
