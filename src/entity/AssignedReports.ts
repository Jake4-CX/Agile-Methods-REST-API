import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Reports } from "./Reports"
import { Users } from "./Users"

@Entity()
export class AssignedReports {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(type => Reports, report => report.id, { nullable: false })
    report: number

    @ManyToOne(type => Users, user => user.id, { nullable: false })
    user: number

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", nullable: false})
    assigned_date: Date

    @Column()
    assigned_status: boolean

}