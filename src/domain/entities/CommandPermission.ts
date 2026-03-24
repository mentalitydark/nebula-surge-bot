import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export interface CommandPermissionModel {
  id: number;
  commandName: string;
  roleId: string;
  guildId: string;
  createdAt: Date;
  updatedAt: Date | null;
}

@Entity({ name: "command_permission" })
export class CommandPermission implements CommandPermissionModel {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "command_name", type: "varchar" })
  commandName: string;

  @Column({ name: "role_id", type: "varchar" })
  roleId: string;

  @Column({ name: "guild_id", type: "varchar" })
  guildId: string;

  @CreateDateColumn({ name: "created_at", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, default: null, onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date | null;
}
