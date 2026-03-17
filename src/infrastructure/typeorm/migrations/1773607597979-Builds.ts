import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Builds1773607597979 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(
        new Table({
          name: "builds",
          columns: [
            {
              name: "id",
              type: "integer",
              isPrimary: true,
              isGenerated: true,
              generationStrategy: "increment"
            },
            {
              name: "equipament",
              type: "text",
              isNullable: false,
              isUnique: true
            },
            {
              name: "content",
              type: "text",
              isNullable: false
            },
            {
              name: "created_at",
              type: "timestamp",
              default: "now()",
              isNullable: false
            },
            {
              name: "updated_at",
              type: "timestamp",
              isNullable: true,
              onUpdate: "now()"
            }
          ]
        })
      )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable("builds")
    }

}
