import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export interface BuildsModel {
  id: number;
  equipament: string;
  content: string;
  createdAt: Date;
  updatedAt: Date|null;
}

@Entity({ name: "builds" })
export class Builds implements BuildsModel {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: "text", unique: true })
    equipament: string;

    @Column({ type: "text" })
    content: string;

    @CreateDateColumn({ name: "created_at", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at", nullable: true, default: null, onUpdate: "CURRENT_TIMESTAMP"})
    updatedAt: Date|null;
}