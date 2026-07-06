import * as migration_20260706_160748 from './20260706_160748';

export const migrations = [
  {
    up: migration_20260706_160748.up,
    down: migration_20260706_160748.down,
    name: '20260706_160748'
  },
];
