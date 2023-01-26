import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class ReportTypes {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    report_type_name: string

    @Column()
    report_type_description: string

}