import {
    DeleteCommand,
    GetCommand,
    PutCommand,
    ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { AppError } from '../middleware/error-handler';
import { dynamodb, permissionsTableName } from '../lib/dynamodb';
import {
    createPermissionSchema,
    permissionSchema,
    type CreatePermissionInput,
    type Permission,
    type UpdatePermissionInput,
} from '../validators/permission.validator';

class PermissionService {
    async findAll(filters?: { roleName?: string; isActive?: boolean }) {
        const result = await dynamodb.send(
            new ScanCommand({
                TableName: permissionsTableName,
            })
        );

        let items = (result.Items ?? []).map((item) => permissionSchema.parse(item));

        if (filters?.roleName) {
            const query = filters.roleName.toLowerCase();
            items = items.filter((item) => item.roleName.toLowerCase().includes(query));
        }

        if (typeof filters?.isActive === 'boolean') {
            items = items.filter((item) => item.isActive === filters.isActive);
        }

        return items.sort((a, b) => a.id - b.id);
    }

    async findById(id: number) {
        const result = await dynamodb.send(
            new GetCommand({
                TableName: permissionsTableName,
                Key: { id },
            })
        );

        if (!result.Item) {
            throw new AppError(404, 'Permission not found');
        }

        return permissionSchema.parse(result.Item);
    }

    async create(input: CreatePermissionInput) {
        const data = createPermissionSchema.parse(input);
        const existing = await this.findByRoleNameExact(data.roleName);

        if (existing) {
            throw new AppError(409, 'A permission with this roleName already exists');
        }

        const now = new Date().toISOString();
        const item: Permission = {
            id: Date.now(),
            roleName: data.roleName,
            isActive: data.isActive,
            policy: data.policy,
            createdAt: now,
            updatedAt: now,
        };

        await dynamodb.send(
            new PutCommand({
                TableName: permissionsTableName,
                Item: item,
                ConditionExpression: 'attribute_not_exists(id)',
            })
        );

        return item;
    }

    async update(id: number, input: UpdatePermissionInput) {
        const existing = await this.findById(id);

        if (
            input.roleName &&
            input.roleName.toLowerCase() !== existing.roleName.toLowerCase()
        ) {
            const duplicate = await this.findByRoleNameExact(input.roleName);
            if (duplicate) {
                throw new AppError(409, 'A permission with this roleName already exists');
            }
        }

        const updated: Permission = permissionSchema.parse({
            ...existing,
            ...input,
            updatedAt: new Date().toISOString(),
        });

        await dynamodb.send(
            new PutCommand({
                TableName: permissionsTableName,
                Item: updated,
            })
        );

        return updated;
    }

    async delete(id: number) {
        await this.findById(id);

        await dynamodb.send(
            new DeleteCommand({
                TableName: permissionsTableName,
                Key: { id },
            })
        );

        return { id };
    }

    private async findByRoleNameExact(roleName: string) {
        const items = await this.findAll();
        return items.find(
            (item) => item.roleName.toLowerCase() === roleName.toLowerCase()
        );
    }
}

export const permissionService = new PermissionService();
