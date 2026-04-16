import request from 'supertest';
import { app } from '../app';
import type { CreatePermissionInput } from '../validators/permission.validator';

describe('permissions true e2e CRUD', () => {
    let createdId: number | undefined;
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    afterAll(async () => {
        if (!createdId) {
            return;
        }

        await request(app).delete(`/permissions/${createdId}`);
    }, 30000);

    it(
        'creates, lists, gets, updates, patches, and deletes a permission with no mocks',
        async () => {
            const createPayload: CreatePermissionInput = {
                roleName: `e2e-role-${uniqueSuffix}`,
                isActive: true,
                policy: {
                    version: '1.0',
                    statements: [
                        {
                            effect: 'Allow',
                            resources: [
                                {
                                    path: `/e2e/${uniqueSuffix}`,
                                    methods: ['GET', 'POST'],
                                },
                            ],
                        },
                    ],
                },
            };

            const createResponse = await request(app)
                .post('/permissions')
                .set('accept', 'application/json')
                .send(createPayload);

            expect(createResponse.status).toBe(201);
            expect(createResponse.body.success).toBe(true);
            expect(createResponse.body.data.roleName).toBe(createPayload.roleName);
            expect(createResponse.body.data.isActive).toBe(true);

            createdId = createResponse.body.data.id;

            expect(typeof createdId).toBe('number');

            const listResponse = await request(app)
                .get('/permissions')
                .query({ roleName: createPayload.roleName })
                .set('accept', 'application/json');

            expect(listResponse.status).toBe(200);
            expect(listResponse.body.success).toBe(true);
            expect(
                listResponse.body.data.some(
                    (item: { id: number; roleName: string }) =>
                        item.id === createdId && item.roleName === createPayload.roleName
                )
            ).toBe(true);

            const getResponse = await request(app)
                .get(`/permissions/${createdId}`)
                .set('accept', 'application/json');

            expect(getResponse.status).toBe(200);
            expect(getResponse.body.success).toBe(true);
            expect(getResponse.body.data.id).toBe(createdId);
            expect(getResponse.body.data.roleName).toBe(createPayload.roleName);

            const putPayload = {
                roleName: `e2e-role-updated-${uniqueSuffix}`,
                isActive: false,
                policy: {
                    version: '1.0',
                    statements: [
                        {
                            effect: 'Deny',
                            resources: [
                                {
                                    path: `/e2e/${uniqueSuffix}`,
                                    methods: ['DELETE'],
                                },
                            ],
                        },
                    ],
                },
            } as const;

            const putResponse = await request(app)
                .put(`/permissions/${createdId}`)
                .set('accept', 'application/json')
                .send(putPayload);

            expect(putResponse.status).toBe(200);
            expect(putResponse.body.success).toBe(true);
            expect(putResponse.body.data.roleName).toBe(putPayload.roleName);
            expect(putResponse.body.data.isActive).toBe(false);
            expect(putResponse.body.data.policy.statements[0].effect).toBe('Deny');

            const patchResponse = await request(app)
                .patch(`/permissions/${createdId}`)
                .set('accept', 'application/json')
                .send({ isActive: true });

            expect(patchResponse.status).toBe(200);
            expect(patchResponse.body.success).toBe(true);
            expect(patchResponse.body.data.id).toBe(createdId);
            expect(patchResponse.body.data.isActive).toBe(true);

            const deleteResponse = await request(app)
                .delete(`/permissions/${createdId}`)
                .set('accept', 'application/json');

            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body.success).toBe(true);
            expect(deleteResponse.body.data.id).toBe(createdId);

            const deletedId = createdId;
            createdId = undefined;

            const notFoundResponse = await request(app)
                .get(`/permissions/${deletedId}`)
                .set('accept', 'application/json');

            expect(notFoundResponse.status).toBe(404);
            expect(notFoundResponse.body.success).toBe(false);
            expect(notFoundResponse.body.error.message).toBe('Permission not found');
        },
        30000
    );
});
