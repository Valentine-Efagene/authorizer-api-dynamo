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

  it('serves the Swagger UI page', async () => {
    const response = await request(app).get('/api-docs');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
    expect(response.text).toContain('SwaggerUIBundle');
    expect(response.text).toContain('swagger-ui');
    expect(response.text).toContain('https://unpkg.com/swagger-ui-dist@5/swagger-ui.css');
  });
});