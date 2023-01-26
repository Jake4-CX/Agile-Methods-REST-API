import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Reports } from "./Reports"
import { Users } from "./Users"

@Entity()
export class ReportUpdates {

  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => Users, user => user.id, { nullable: false })
  user_id: number

  @ManyToOne(type => Reports, report => report.id, { nullable: false })
  report_id: number

  @Column()
  report_update_text: string

  @Column()
  report_date: Date

  @Column()
  image_group_id: number

}