import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Reports } from "./Reports"
import { Users } from "./Users"

@Entity()
export class AssignedReports {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(type => Reports, report => report.id, { nullable: false })
    report: Reports

    @ManyToOne(type => Users, user => user.id, { nullable: false })
    user: Users

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", nullable: false})
    assigned_date: Date

}