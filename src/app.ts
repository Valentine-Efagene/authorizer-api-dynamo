import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { generateOpenAPIDocument } from './config/swagger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { permissionRouter } from './routes/permissions';

export const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            service: 'authorizer-api-dynamo',
        },
    });
});

app.get('/openapi.json', (_req, res) => {
    res.json(generateOpenAPIDocument());
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(generateOpenAPIDocument()));
app.use('/permissions', permissionRouter);

app.use(notFoundHandler);
app.use(errorHandler);
