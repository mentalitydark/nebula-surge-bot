import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTableCommandPermissions1774323533643 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(
        new Table({
          name: "command_permissions",
          columns: [
            {
              name: "id",
              type: "integer",
              isPrimary: true,
              isGenerated: true,
              generationStrategy: "increment"
            },
            {
              name: "command",
              type: "varchar",
              isNullable: false
            },
            {
              name: "role",
              type: "varchar",
              isNullable: false
            },
            {
              name: "guild",
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
              columnNames: ["command", "role", "guild"],
              isUnique: true
            },
            {
              columnNames: ["command"]
            },
            {
              columnNames: ["role"]
            },
            {
              columnNames: ["guild"]
            }
          ]
        })
      )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable("command_permissions", true)
    }

}
