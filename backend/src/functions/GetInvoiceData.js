const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const connectionString = process.env.COSMOS_DB_CONNECTION;
const client = new CosmosClient(connectionString);
const database = client.database('chinatrade-cosmos');
const container = database.container('ProcessingResults');

app.http('GetInvoiceData', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const fileName = request.query.get('fileName');

        if (!fileName) {
            return {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing fileName parameter' })
            };
        }

        try {
            // Query Cosmos DB for the document with matching id
            const { resources } = await container.items
                .query({
                    query: 'SELECT * FROM c WHERE c.id = @fileName',
                    parameters: [{ name: '@fileName', value: fileName }]
                })
                .fetchAll();

            if (resources && resources.length > 0) {
                return {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: true,
                        data: resources[0]
                    })
                };
            } else {
                return {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: false,
                        message: 'Processing not yet complete or file not found'
                    })
                };
            }
        } catch (error) {
            context.log(`ERROR: ${error.message}`);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: error.message })
            };
        }
    }
});