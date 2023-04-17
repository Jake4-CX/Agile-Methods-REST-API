import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm"
import { ImageGroups } from "./ImageGroups"
import { Images } from "./Images"
import { ReportTypes } from "./ReportTypes"
import { Users } from "./Users"
import { Addresses } from "./Addresses"

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

    @Column({type: "decimal", precision: 10, scale: 8})
    report_latitude: number

    @Column({type: "decimal", precision: 10, scale: 8})
    report_longitude: number

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", nullable: false})
    report_date: Date

    @Column()
    report_severity: number

    @Column()
    report_status: boolean

    @ManyToOne(type => ImageGroups, imageGroups => imageGroups.id, { nullable: false, onDelete: "CASCADE" })
    image_group: number

    @ManyToOne(type => Users, user => user.id, { nullable: false })
    user: Users

    @OneToOne(type => Addresses, address => address.id, { nullable: true })
    @JoinColumn()
    address: Addresses
    
  report_votes?: { upvotes: number; downvotes: number }
  report_images?: Images[]

}