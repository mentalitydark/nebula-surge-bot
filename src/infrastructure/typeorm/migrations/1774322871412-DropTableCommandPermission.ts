import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class DropTableCommandPermission1774322871412 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable("command_permission")
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
              name: "command",
              type: "varchar",
              isNullable: false
            },
            {
              name: "role_id",
              type: "varchar",
              isNullable: false
            }
          ],
          indices: [
            {
              columnNames: ["command", "role_id"],
              isUnique: true
            },
            {
              columnNames: ["command"]
            },
            {
              columnNames: ["role_id"]
            }
          ]
        })
      )
    }

}
