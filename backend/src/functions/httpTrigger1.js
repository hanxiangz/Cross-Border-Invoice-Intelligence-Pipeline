const { app, output } = require('@azure/functions');

const cosmosOutput = output.cosmosDB({
    databaseName: 'chinatrade-cosmos',
    containerName: 'ProcessingResults',
    connection: 'COSMOS_DB_CONNECTION'
});

app.http('httpTrigger1', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    extraOutputs: [cosmosOutput],
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'world';

        const document = {
            id: 'some-id',
            name,
            createdAt: new Date().toISOString()
        };

        context.extraOutputs.set(cosmosOutput, document);

        return { body: `Hello, ${name}!` };
    }
});
