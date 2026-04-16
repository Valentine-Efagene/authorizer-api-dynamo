import { jest } from '@jest/globals';
import request from 'supertest';
import { AppError } from '../middleware/error-handler';
import { app } from '../app';
import { permissionService } from '../services/permission.service';
import type { CreatePermissionInput, Permission } from '../validators/permission.validator';

const basePermission: Permission = {
    id: 101,
    roleName: 'admin',
    isActive: true,
    policy: {
        version: '1.0',
        statements: [
            {
                effect: 'Allow',
                resources: [
                    {
                        path: '/permissions',
                        methods: ['GET', 'POST'],
                    },
                ],
            },
        ],
    },
    createdAt: '2026-04-16T00:00:00.000Z',
    updatedAt: '2026-04-16T00:00:00.000Z',
};

describe('permissions api CRUD', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('lists permissions', async () => {
        const findAllSpy = jest
            .spyOn(permissionService, 'findAll')
            .mockResolvedValue([basePermission]);

        const response = await request(app)
            .get('/permissions')
            .query({ roleName: 'admin', isActive: 'true' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            data: [basePermission],
        });
        expect(findAllSpy).toHaveBeenCalledWith({ roleName: 'admin', isActive: true });
    });

    it('creates a permission', async () => {
        const createPayload: CreatePermissionInput = {
            roleName: 'editor',
            isActive: true,
            policy: {
                version: '1.0' as const,
                statements: [
                    {
                        effect: 'Allow' as const,
                        resources: [
                            {
                                path: '/articles',
                                methods: ['GET', 'POST'],
                            },
                        ],
                    },
                ],
            },
        };

        jest.spyOn(permissionService, 'create').mockResolvedValue({
            ...basePermission,
            id: 102,
            roleName: 'editor',
            policy: createPayload.policy,
        });

        const response = await request(app)
            .post('/permissions')
            .set('accept', 'application/json')
            .send(createPayload);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.roleName).toBe('editor');
        expect(response.body.data.policy.statements[0].resources[0].path).toBe('/articles');
    });

    it('gets a permission by id', async () => {
        jest.spyOn(permissionService, 'findById').mockResolvedValue(basePermission);

        const response = await request(app).get('/permissions/101');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            data: basePermission,
        });
    });

    it('updates a permission with put', async () => {
        const updatedPermission: Permission = {
            ...basePermission,
            roleName: 'super-admin',
            updatedAt: '2026-04-16T01:00:00.000Z',
        };

        jest.spyOn(permissionService, 'update').mockResolvedValue(updatedPermission);

        const response = await request(app)
            .put('/permissions/101')
            .send({ roleName: 'super-admin' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            data: updatedPermission,
        });
    });

    it('updates a permission with patch', async () => {
        const updatedPermission: Permission = {
            ...basePermission,
            isActive: false,
            updatedAt: '2026-04-16T02:00:00.000Z',
        };

        jest.spyOn(permissionService, 'update').mockResolvedValue(updatedPermission);

        const response = await request(app)
            .patch('/permissions/101')
            .send({ isActive: false });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            data: updatedPermission,
        });
    });

    it('deletes a permission', async () => {
        jest.spyOn(permissionService, 'delete').mockResolvedValue({ id: 101 });

        const response = await request(app).delete('/permissions/101');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            data: { id: 101 },
        });
    });

    it('returns a not found error for a missing permission', async () => {
        jest
            .spyOn(permissionService, 'findById')
            .mockRejectedValue(new AppError(404, 'Permission not found'));

        const response = await request(app).get('/permissions/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            success: false,
            error: {
                message: 'Permission not found',
            },
        });
    });
});
