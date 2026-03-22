import type { Config } from 'jest';
import 'reflect-metadata';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^#env$': '<rootDir>/src/env.ts',
    '^#base$': '<rootDir>/src/discord/index.ts',
    '^#functions$': '<rootDir>/src/functions/index.ts',
    '^#database$': '<rootDir>/src/database/index.ts',
    '^#server$': '<rootDir>/src/server/index.ts',
    '^#menus$': '<rootDir>/src/menus/index.ts',
    '^#tools$': '<rootDir>/src/tools/index.ts',
    '^#lib/(.*)$': '<rootDir>/src/lib/$1',
    '^#shared/(.*)$': '<rootDir>/src/shared/$1',
    '^#types/(.*)$': '<rootDir>/src/@types/$1',
    '^#entities$': '<rootDir>/src/domain/entities/index.ts',
    '^#errors$': '<rootDir>/src/domain/errors/index.ts',
    '^#domain/(.*)$': '<rootDir>/src/domain/$1',
    '^#repositories$': '<rootDir>/src/infrastructure/repositories/index.ts',
    '^#typeorm$': '<rootDir>/src/infrastructure/typeorm/index.ts',
    '^#emojis$': '<rootDir>/emojis.json',
    '^@magicyan/discord$': '<rootDir>/node_modules/@magicyan/discord',
    // Resolve importações locais terminadas em .js para .ts
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        diagnostics: {
          ignoreCodes: [151002] // Esconde o aviso de WARN de "hybrid module kind"
        }
      }
    ]
  },
  testMatch: [
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.spec.ts'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/build/']
};

export default config;
