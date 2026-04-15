import { Router } from 'express';
import { z } from 'zod';
import { permissionService } from '../services/permission.service';
import {
    createPermissionSchema,
    updatePermissionSchema,
} from '../validators/permission.validator';

export const permissionRouter = Router();

const idSchema = z.coerce.number().int().positive();

permissionRouter.get('/', async (req, res, next) => {
    try {
        const roleName =
            typeof req.query.roleName === 'string' ? req.query.roleName : undefined;

        const isActive =
            typeof req.query.isActive === 'string'
                ? req.query.isActive === 'true'
                : undefined;

        const permissions = await permissionService.findAll({ roleName, isActive });
        res.json({ success: true, data: permissions });
    } catch (error) {
        next(error);
    }
});

permissionRouter.post('/', async (req, res, next) => {
    try {
        const input = createPermissionSchema.parse(req.body);
        const permission = await permissionService.create(input);
        res.status(201).json({ success: true, data: permission });
    } catch (error) {
        next(error);
    }
});

permissionRouter.get('/:id', async (req, res, next) => {
    try {
        const id = idSchema.parse(req.params.id);
        const permission = await permissionService.findById(id);
        res.json({ success: true, data: permission });
    } catch (error) {
        next(error);
    }
});

permissionRouter.put('/:id', async (req, res, next) => {
    try {
        const id = idSchema.parse(req.params.id);
        const input = updatePermissionSchema.parse(req.body);
        const permission = await permissionService.update(id, input);
        res.json({ success: true, data: permission });
    } catch (error) {
        next(error);
    }
});

permissionRouter.patch('/:id', async (req, res, next) => {
    try {
        const id = idSchema.parse(req.params.id);
        const input = updatePermissionSchema.parse(req.body);
        const permission = await permissionService.update(id, input);
        res.json({ success: true, data: permission });
    } catch (error) {
        next(error);
    }
});

permissionRouter.delete('/:id', async (req, res, next) => {
    try {
        const id = idSchema.parse(req.params.id);
        const result = await permissionService.delete(id);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});
