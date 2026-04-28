import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ethers } from 'ethers';

describe('Authentication E2E (auth.e2e-spec.ts)', () => {
  let app: INestApplication;
  let testWallet: any;

  beforeAll(async () => {
    // Create a test wallet
    testWallet = ethers.Wallet.createRandom();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/challenge', () => {
    it('should return a challenge message for a wallet address', () => {
      return request(app.getHttpServer())
        .post('/auth/challenge')
        .send({ address: testWallet.address })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toContain('Sign in to TruthBounty:');
          expect(res.body.address).toBe(testWallet.address);
        });
    });

    it('should reject invalid address format', () => {
      return request(app.getHttpServer())
        .post('/auth/challenge')
        .send({ address: 'invalid-address' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    let challengeMessage: string;

    beforeEach(async () => {
      // Get a challenge
      const challengeRes = await request(app.getHttpServer())
        .post('/auth/challenge')
        .send({ address: testWallet.address });

      challengeMessage = challengeRes.body.message;
    });

    it('should login successfully with valid signature', async () => {
      // Sign the challenge message
      const signature = await testWallet.signMessage(challengeMessage);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          address: testWallet.address,
          signature,
          message: challengeMessage,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.user.address).toBe(testWallet.address.toLowerCase());
        });
    });

    it('should reject invalid signature', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          address: testWallet.address,
          signature: '0xinvalid',
          message: challengeMessage,
        })
        .expect(400);
    });

    it('should reject mismatched address', async () => {
      const signature = await testWallet.signMessage(challengeMessage);
      const wrongWallet = ethers.Wallet.createRandom();

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          address: wrongWallet.address,
          signature,
          message: challengeMessage,
        })
        .expect(401);
    });

    it('should reject expired or used nonce', async () => {
      const signature = await testWallet.signMessage(challengeMessage);

      // First login should succeed
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          address: testWallet.address,
          signature,
          message: challengeMessage,
        })
        .expect(201);

      // Second login with same nonce should fail
      const signature2 = await testWallet.signMessage(challengeMessage);
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          address: testWallet.address,
          signature: signature2,
          message: challengeMessage,
        })
        .expect(401);
    });
  });

  describe('Protected Endpoints', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Get challenge and login
      const challengeRes = await request(app.getHttpServer())
        .post('/auth/challenge')
        .send({ address: testWallet.address });

      const signature = await testWallet.signMessage(challengeRes.body.message);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          address: testWallet.address,
          signature,
          message: challengeRes.body.message,
        });

      accessToken = loginRes.body.accessToken;
    });

    it('should allow access to protected endpoint with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.address).toBe(testWallet.address.toLowerCase());
        });
    });

    it('should reject access without token', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(403);
    });

    it('should reject access with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });

    it('should require auth for POST /claims', () => {
      return request(app.getHttpServer())
        .post('/claims')
        .send({ title: 'Test claim' })
        .expect(403);
    });

    it('should allow GET /claims/latest without auth', () => {
      return request(app.getHttpServer())
        .get('/claims/latest')
        .expect(200);
    });
  });
});
