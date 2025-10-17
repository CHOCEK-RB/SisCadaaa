import { NestFactory } from '@nestjs/core';
import { SeedingModule } from './seeding.module';
import { ISeederService } from './application/iseeder.service';
import { ISeederServiceAcademic } from './application/iseeder_academic.service';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeedingModule);

  try {
    const seeder = appContext.get<ISeederService>(ISeederService);
    const seederAcademic = appContext.get<ISeederServiceAcademic>(
      ISeederServiceAcademic,
    );

    console.log('Running main seeder...');
    await seeder.runAll();
    console.log('Main seeder finished.');

    console.log('Running academic seeder...');
    await seederAcademic.runAll();
    console.log('Academic seeder finished.');

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    console.log('Closing application context...');
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
