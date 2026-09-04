/** Shared BDD discovery options. Generated files are disposable implementation details. */
export const bddConfig = {
  features: ['features/**/*.feature'],
  // The fixture module must be discoverable so bddgen can resolve the custom test instance.
  steps: ['steps/**/*.ts', 'src/fixtures/api-fixtures.ts'],
  outputDir: '.features-gen',
};
