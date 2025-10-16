import { NestFactory } from '@nestjs/core';
import { SeedingModule } from './seeding.module';
import { ISeederService } from './application/iseeder.service';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeedingModule);

  const seeder = appContext.get<ISeederService>(ISeederService);

  try {
    await seeder.runAll();
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);

    throw error;
  } finally {
    await appContext.close();
  }
}

bootstrap().catch((error) => {
  console.error(
    'An unhandled error occurred during the seeding process:',
    error,
  );
  process.exit(1);
});
