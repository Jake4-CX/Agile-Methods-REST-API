import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { AccountRoles } from "./AccountRoles";

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

    @Column()
    registration_date: Date

    @Column()
    last_login_date: Date

    @ManyToOne(type => AccountRoles, account_role => account_role.id, { nullable: false })
    account_role_id: AccountRoles

}
