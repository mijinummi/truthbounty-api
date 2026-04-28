import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async verifyWorldcoin(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.worldcoinVerified) {
      throw new ConflictException('User already verified');
    }

    // 🔐 In real implementation:
    // - verify Worldcoin proof here (orb / zk proof)
    // - validate signature / nullifier

    user.worldcoinVerified = true;
    user.worldcoinVerifiedAt = new Date();

    await this.userRepo.save(user);

    return {
      userId,
      verified: true,
      verifiedAt: user.worldcoinVerifiedAt,
    };
  }
}