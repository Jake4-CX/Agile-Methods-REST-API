import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from "typeorm"
import { AccountRoles } from "./AccountRoles";
import { Addresses } from "./Addresses";
import { Reports } from "./Reports";

@Entity()
export class Users {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    user_email: string

    @Column()
    user_password: string

    @Column()
    first_name: string

    @Column()
    last_name: string

    @Column()
    user_uuid: string

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", nullable: false})
    registration_date: Date

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", nullable: false})
    last_login_date: Date

    @ManyToOne(type => AccountRoles, account_role => account_role.id, { nullable: false })
    account_role: AccountRoles

    @OneToOne(type => Addresses, address => address.id, { nullable: true })
    @JoinColumn()
    address: Addresses

    @Column({type: "boolean", default: false, nullable: false})
    verified: boolean

    reports?: Reports[]
    report_info?: { total_reports: number, total_reports_open: number, total_reports_closed: number }
}
