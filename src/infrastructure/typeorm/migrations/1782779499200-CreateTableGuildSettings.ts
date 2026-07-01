import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTableGuildSettings1782779499200 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "guild_settings",
            columns: [{
                name: "id",
                type: "integer",
                isPrimary: true,
                isGenerated: true,
                generationStrategy: "increment"
            }, {
                name: "guild",
                type: "varchar",
                isNullable: false
            }, {
                name: "settings",
                type: "simple-json",
                isNullable: true
            }, {
                name: "created_at",
                type: "timestamp",
                default: "now()"
            }, {
                name: "updated_at",
                type: "timestamp",
                default: "now()",
                onUpdate: "now()"
            }],
            indices: [{
                name: "IDX_GUILD_SETTINGS_GUILD",
                columnNames: ["guild"],
                isUnique: true
            }]
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("guild_settings");
    }

}
