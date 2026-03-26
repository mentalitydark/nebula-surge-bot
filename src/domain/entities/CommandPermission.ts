import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export interface CommandPermissionModel {
  id: number;
  command: string;
  role: string;
  guild: string;
  createdAt: Date;
  updatedAt: Date | null;
}

@Entity({ name: "command_permissions" })
@Index(["command", "role", "guild"], { unique: true })
@Index(["command"])
@Index(["role"])
@Index(["guild"])
export class CommandPermission implements CommandPermissionModel {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "command", type: "varchar" })
  command: string;

  @Column({ name: "role", type: "varchar" })
  role: string;

  @Column({ name: "guild", type: "varchar" })
  guild: string;

  @CreateDateColumn({ name: "created_at", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, default: null, onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date | null;
}
