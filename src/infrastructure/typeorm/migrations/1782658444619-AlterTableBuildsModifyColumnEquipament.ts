import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterTableBuildsModifyColumnEquipament1782658444619 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('builds', 'equipament', "equipment");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('builds', 'equipment', "equipament");
  }

}
