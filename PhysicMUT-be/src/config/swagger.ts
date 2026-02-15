import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PhysicMUT API',
      version: '1.0.0',
      description: 'API documentation for PhysicMUT Backend',
      contact: {
        name: 'TanLoc-DEV04',
        url: 'https://github.com/TanLoc-DEV04/PhysicMUT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts', './src/index.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
