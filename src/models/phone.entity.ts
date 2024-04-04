import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import User from "./user.entity"

@Entity()
export default class Phone extends BaseEntity{
    @PrimaryGeneratedColumn()
    id!: number

    @Column({name: 'user_id'})
    userId!: number

    @ManyToOne(() => User, user => user.tasks)
    user!: User

    @Column()
    phoneNumber!: Number
}