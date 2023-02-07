import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { ImageGroups } from "./ImageGroups"
import { ReportTypes } from "./ReportTypes"
import { Users } from "./Users"

@Entity()
export class Reports {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    report_uuid: string

    @ManyToOne(type => ReportTypes, reportType => reportType.id, { nullable: false })
    report_type: number

    @Column()
    report_description: string

    @Column()
    report_latitude: number

    @Column()
    report_longitude: number

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", nullable: false})
    report_date: Date

    @Column()
    report_serverity: number

    @Column()
    report_status: boolean

    @ManyToOne(type => ImageGroups, imageGroups => imageGroups.id, { nullable: false, onDelete: "CASCADE" })
    image_group: number

    @ManyToOne(type => Users, user => user.id, { nullable: false })
    user: number

}