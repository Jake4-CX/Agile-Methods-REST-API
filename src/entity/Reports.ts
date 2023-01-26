import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { ImageGroups } from "./ImageGroups"
import { Users } from "./Users"

@Entity()
export class Reports {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    report_uuid: string

    @Column()
    report_type_id: number

    @Column()
    report_description: string

    @Column()
    report_latitude: number

    @Column()
    report_longitude: number

    @Column()
    report_date: Date

    @Column()
    report_serverity: number

    @Column()
    report_status: boolean

    @ManyToOne(type => ImageGroups, imageGroups => imageGroups.id, { nullable: false, onDelete: "CASCADE" })
    image_group_id: number

    @ManyToOne(type => Users, user => user.id, { nullable: false })
    user_id: number

}