import { Module, OnModuleInit } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [AuthModule],
})
export class AdminModule implements OnModuleInit {
  constructor(private authService: AuthService) {}

  async onModuleInit() {
    // Create default admin when the application starts
    const isAdminCreated = await this.authService.createDefaultAdmin();

    if (isAdminCreated) {
      console.info('Admin user created successfully.');
    }
  }
}
