/** Shared BDD discovery options. Generated files are disposable implementation details. */
export const bddConfig = {
  features: ['features/**/*.feature'],
  // Support feature-adjacent step definitions and the shared root-level step library.
  // The fixture module must also be discoverable so bddgen can resolve the custom test instance.
  steps: ['features/steps/**/*.ts', 'steps/**/*.ts', 'src/fixtures/api-fixtures.ts'],
  outputDir: '.features-gen',
};
