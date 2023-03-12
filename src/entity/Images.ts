import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { ImageGroups } from "./ImageGroups"

@Entity()
export class Images {

  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => ImageGroups, imageGroups => imageGroups.id, { nullable: false })
  image_group: ImageGroups | number

  @Column()
  image_uuid: string

  @Column()
  image_file_type: string

  @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", nullable: false})
  upload_date: Date
}