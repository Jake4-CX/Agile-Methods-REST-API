import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { ImageGroups } from "./ImageGroups"
import { Reports } from "./Reports"
import { Users } from "./Users"
import { Images } from "./Images"

@Entity()
export class ReportUpdates {

  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => Users, user => user.id, { nullable: false })
  user: Users

  @ManyToOne(type => Reports, report => report.id, { nullable: false })
  report: Reports

  @Column()
  report_update_text: string

  @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", nullable: false})
  report_date: Date

  @ManyToOne(type => ImageGroups, imageGroups => imageGroups.id, { nullable: false, onDelete: "CASCADE" })
  image_group: number

  update_images?: Images[]
}