import request from 'supertest';
import { app } from '../app';

describe('app endpoints', () => {
  it('returns a healthy status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('healthy');
  });

  it('serves the OpenAPI document', async () => {
    const response = await request(app).get('/openapi.json');

    expect(response.status).toBe(200);
    expect(response.body.info.title).toBe('Permissions API');
    expect(response.body.paths['/permissions']).toBeDefined();
  });
});