import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Reports } from "./Reports"
import { Users } from "./Users"

@Entity()
export class ReportUpdates {

  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => Users, user => user.id, { nullable: false })
  user: number

  @ManyToOne(type => Reports, report => report.id, { nullable: false })
  report: number

  @Column()
  report_update_text: string

  @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", nullable: false})
  report_date: Date

  @Column()
  image_group_id: number

}