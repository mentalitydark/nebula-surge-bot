import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTableCommandPermission1774323533643 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(
        new Table({
          name: "command_permission",
          columns: [
            {
              name: "id",
              type: "integer",
              isPrimary: true,
              isGenerated: true,
              generationStrategy: "increment"
            },
            {
              name: "command_name",
              type: "varchar",
              isNullable: false
            },
            {
              name: "role_id",
              type: "varchar",
              isNullable: false
            },
            {
              name: "guild_id",
              type: "varchar",
              isNullable: false
            },
            {
              name: "created_at",
              type: "timestamp",
              default: "CURRENT_TIMESTAMP",
              isNullable: false
            },
            {
              name: "updated_at",
              type: "timestamp",
              isNullable: true,
            }
          ],
          indices: [
            {
              columnNames: ["command_name", "role_id", "guild_id"],
              isUnique: true
            },
            {
              columnNames: ["command_name"]
            },
            {
              columnNames: ["role_id"]
            },
            {
              columnNames: ["guild_id"]
            }
          ]
        })
      )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable("command_permission", true)
    }

}
