const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const settingsPath = path.join(__dirname, 'local.settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const conn = settings.Values && settings.Values.AzureWebJobsStorage;
    if (!conn) {
      console.error('AzureWebJobsStorage not found in local.settings.json');
      process.exit(2);
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(conn);
    const containerName = 'localtest-container';
    const containerClient = blobServiceClient.getContainerClient(containerName);

    await containerClient.createIfNotExists();

    const blobName = `test-blob-${Date.now()}.txt`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const content = `hello from local test at ${new Date().toISOString()}`;

    await blockBlobClient.upload(content, Buffer.byteLength(content));
    console.log('Uploaded blob:', blobName);

    // List blobs in the container (show last 5)
    const iter = containerClient.listBlobsFlat();
    const items = [];
    for await (const b of iter) {
      items.push(b.name);
      if (items.length >= 5) break;
    }
    console.log('Recent blobs in', containerName, items);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
