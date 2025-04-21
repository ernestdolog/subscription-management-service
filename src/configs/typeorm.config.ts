import 'reflect-metadata';
import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { appConfig } from './app.config.js';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DirectoryScan } from '#app/directory-scan.js';

const typeOrmOptionsConfiguration: DataSourceOptions = {
    type: 'postgres',
    host: appConfig.database.host,
    port: appConfig.database.port,
    username: appConfig.database.username,
    password: appConfig.database.password,
    database: appConfig.database.database,
    synchronize: false,
    logging: appConfig.database.logging,
    entities: [DirectoryScan.baseDir + '/modules/**/infrastructure/*.dao.{js,ts}'],
    migrations: [DirectoryScan.baseDir + '/migrations/**/*.{js,ts}'],
    namingStrategy: new SnakeNamingStrategy(),
    ssl: false,
};

export const dataSource: DataSource = new DataSource(typeOrmOptionsConfiguration);
