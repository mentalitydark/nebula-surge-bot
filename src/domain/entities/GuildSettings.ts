import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export interface Settings {
  channel_history_id?: string
}

export interface GuildSettingsModel {
  id: number;
  guild: string;
  settings: Settings | null;
}

@Entity({ name: "guild_settings" })
export class GuildSettings implements GuildSettingsModel {

  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: "varchar", unique: true })
  guild: string;

  @Column({ type: "simple-json", nullable: true })
  settings: Settings | null;

  @CreateDateColumn({ name: "created_at", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}
