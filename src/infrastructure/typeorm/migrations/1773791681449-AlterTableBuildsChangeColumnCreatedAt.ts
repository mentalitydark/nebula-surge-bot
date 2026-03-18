import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterTableBuildsChangeColumnCreatedAt1773791681449 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      queryRunner.changeColumn("builds", "created_at", new TableColumn({
        name: "created_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP",
        isNullable: false
      }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      queryRunner.changeColumn("builds", "created_at", new TableColumn({
        name: "created_at",
        type: "timestamp",
        default: "now()",
        isNullable: false
      }))
    }

}
