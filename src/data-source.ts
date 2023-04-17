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
import * as config from "./config"
import { RefreshTokens } from "./entity/RefreshTokens"
import { ReportVotes } from "./entity/ReportVotes"
import { Addresses } from "./entity/Addresses"

export const AppDataSource = new DataSource({
    type: "mariadb",
    host: config.database_address,
    port: config.database_port,
    username: config.database_user,
    password: config.database_password,
    database: config.database_name, 
    synchronize: true,
    logging: false,
    entities: [Users, Addresses, AccountRoles, RefreshTokens, Verification, Reports, ReportVotes, ReportTypes, ReportUpdates, AssignedReports, ImageGroups, Images],
    migrations: [],
    subscribers: [],
    namingStrategy: new SnakeNamingStrategy(),
})
