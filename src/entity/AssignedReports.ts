import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Reports } from "./Reports"
import { Users } from "./Users"

@Entity()
export class AssignedReports {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(type => Reports, report => report.id, { nullable: false })
    report_id: number

    @ManyToOne(type => Users, user => user.id, { nullable: false })
    user_id: number

    @Column()
    assigned_date: Date

    @Column()
    assigned_status: boolean

}