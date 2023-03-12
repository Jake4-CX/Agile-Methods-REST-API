import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Reports } from "./Reports";
import { Users } from "./Users";

@Entity()
export class ReportVotes {

  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => Reports, report => report.id, { nullable: false })
  report: Reports | number

  @Column()
  report_id?: number

  @ManyToOne(type => Users, user => user.id, { nullable: false })
  user: Users | number

  @Column()
  user_id: number

  @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", nullable: false})
  vote_date: Date

  @Column({type: "tinyint", nullable: false})
  vote_type: number
}