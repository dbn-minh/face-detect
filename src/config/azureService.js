import { BlobServiceClient } from "@azure/storage-blob";

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

export const uploadToAzure = async (fileBuffer, fileName, containerName = 'notifications') => {
    if (!AZURE_STORAGE_CONNECTION_STRING) {
        throw new Error("Azure Storage connection string is not set");
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    await containerClient.createIfNotExists({ access: "container" });

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Upload file buffer to blob
    await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: "image/jpeg" }
    });

    return blockBlobClient.url;  // Trả về URL của file trên Azure
};
