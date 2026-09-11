const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  // jest-dom (toBeInTheDocument, …) chargé une fois pour tous les tests de
  // composants, au lieu d'un import manuel dans chaque fichier.
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/e2e/'],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'app/api/**/*.ts',
    '!**/*.d.ts',
    '!lib/**/index.ts',
    '!components/**/index.ts',
  ],
};

module.exports = createJestConfig(config);
