import { Module, Global } from '@nestjs/common';
import { MockDbService } from './mock-db.service';

@Global()
@Module({
  providers: [MockDbService],
  exports: [MockDbService],
})
export class DatabaseModule {}
