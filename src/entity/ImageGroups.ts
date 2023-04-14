import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Users } from "./Users"

@Entity()
export class ImageGroups {

  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => Users, user => user.id, { nullable: false, onDelete: 'CASCADE' })
  user: Users
}