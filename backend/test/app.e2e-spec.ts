import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { configureApp } from '../src/configure-app';

describe('Afisha API (e2e)', () => {
  let app: INestApplication;
  let filmId: string;
  let scheduleId: string;

  beforeAll(async () => {
    process.env.DATABASE_DRIVER = 'memory';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = configureApp(
      moduleFixture.createNestApplication<NestExpressApplication>(),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/afisha/films returns the film list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/afisha/films')
      .expect(200);

    expect(res.body.total).toBeGreaterThan(0);
    expect(Array.isArray(res.body.items)).toBe(true);
    filmId = res.body.items[0].id;
  });

  it('GET /api/afisha/films/:id/schedule returns the schedule', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/afisha/films/${filmId}/schedule`)
      .expect(200);

    expect(res.body.total).toBeGreaterThan(0);
    scheduleId = res.body.items[0].id;
  });

  it('GET /api/afisha/films/:id/schedule with unknown id returns 404', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/afisha/films/00000000-0000-0000-0000-000000000000/schedule')
      .expect(404);

    expect(res.body.error).toBeDefined();
  });

  it('POST /api/afisha/order books free seats', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/afisha/order')
      .send({
        email: 'test@test.ru',
        phone: '+7 (000) 000-00-00',
        tickets: [
          {
            film: filmId,
            session: scheduleId,
            daytime: new Date().toISOString(),
            row: 9,
            seat: 9,
            price: 350,
          },
        ],
      })
      .expect(200);

    expect(res.body.total).toBe(1);
    expect(res.body.items[0].id).toBeDefined();
  });

  it('POST /api/afisha/order fails when the seat is already taken', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/afisha/order')
      .send({
        email: 'test@test.ru',
        phone: '+7 (000) 000-00-00',
        tickets: [
          {
            film: filmId,
            session: scheduleId,
            daytime: new Date().toISOString(),
            row: 9,
            seat: 9,
            price: 350,
          },
        ],
      })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  it('GET /content/afisha/bg1s.jpg serves static content', () => {
    return request(app.getHttpServer())
      .get('/content/afisha/bg1s.jpg')
      .expect(200);
  });
});
