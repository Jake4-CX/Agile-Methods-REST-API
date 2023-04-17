import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Addresses {

  @PrimaryGeneratedColumn()
  id: number

  @Column({nullable: true})
  address_street: string

  @Column({nullable: true})
  address_city: string

  @Column({nullable: true})
  address_county: string

  @Column({nullable: true})
  address_postal_code: string

  @Column({type: "decimal", precision: 10, scale: 8, nullable: false})
  address_latitude: number

  @Column({type: "decimal", precision: 10, scale: 8, nullable: false})
  address_longitude: number
}