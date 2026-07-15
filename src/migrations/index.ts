import * as migration_20260714_111546_initial from './20260714_111546_initial';

export const migrations = [
  {
    up: migration_20260714_111546_initial.up,
    down: migration_20260714_111546_initial.down,
    name: '20260714_111546_initial'
  },
];
