import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Users } from "./Users"

@Entity()
export class Verification {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(type => Users, user => user.id, { nullable: false })
    user_id: number

    @Column()
    verification_uuid: string

    @Column()
    verification_type: number

}