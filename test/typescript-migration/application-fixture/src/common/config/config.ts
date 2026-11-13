export const port = 0;
export const host = '127.0.0.1';
export const workers = 1;
export const label = 'common';
export const processKillTimeout = 1000;
// No database is needed: custom Model methods use an emitted JSON resource.
// Fail if this acceptance fixture unexpectedly attempts to open a connection.
export const model = {
  type: 'fixture',
  fixture: {handle: function NoDatabase() { throw new Error('Database access is outside this fixture'); }}
};
