import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './application/seed_students.service';
import { UserModule } from '../users/users.module';
import { typeOrmConfig } from '../config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.db.env', '.env'] }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    UserModule,
  ],

  providers: [SeedingService],
})
export class SeedingModule {}
