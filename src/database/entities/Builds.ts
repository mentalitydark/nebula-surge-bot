import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "builds" })
export class Builds {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "text", unique: true })
    equipament: string;

    @Column({ type: "text" })
    content: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at", nullable: true, default: null })
    updatedAt: Date|null;
}