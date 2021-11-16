import { DynamicModule, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {
  static import(repositories = []): DynamicModule {
    return {
      module: PrismaModule,
      providers: repositories,
      exports: repositories,
    };
  }
}
