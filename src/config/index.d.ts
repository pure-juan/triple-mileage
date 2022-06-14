export type TCommonConfig = {
  NODE_ENV: 'local' | 'development' | 'production';
};

export type TDatabaseConfig = {
  'database.host': string;
  'database.port': string;
  'database.username': string;
  'database.password': string;
  'database.database': string;
};
