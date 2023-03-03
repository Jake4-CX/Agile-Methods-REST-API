import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Users } from "./Users"

@Entity()
export class RefreshTokens {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(type => Users, user => user.id, { nullable: false })
    user: number

    @Column()
    refresh_token: string

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", nullable: false})
    created_at: Date

    @Column({type: "timestamp", default: () => "DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY)", nullable: false})
    expires_at: Date

}