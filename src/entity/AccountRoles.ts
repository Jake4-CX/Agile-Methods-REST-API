import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class AccountRoles {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    role_name: string

}