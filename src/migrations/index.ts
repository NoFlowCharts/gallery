import * as migration_20260706_160748 from './20260706_160748';
import * as migration_20260706_161316 from './20260706_161316';

export const migrations = [
  {
    up: migration_20260706_160748.up,
    down: migration_20260706_160748.down,
    name: '20260706_160748',
  },
  {
    up: migration_20260706_161316.up,
    down: migration_20260706_161316.down,
    name: '20260706_161316'
  },
];
