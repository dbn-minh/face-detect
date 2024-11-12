import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from 'dotenv';
dotenv.config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_SAS_TOKEN = process.env.AZURE_STORAGE_SAS_TOKEN;

if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error("Azure Storage connection string is not set");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

export const uploadToAzure = async (fileBuffer, fileName, containerName = 'notifications') => {
    if (!AZURE_STORAGE_CONNECTION_STRING) {
        throw new Error("Azure Storage connection string is not set");
    }

    const containerClient = blobServiceClient.getContainerClient(containerName);

    await containerClient.createIfNotExists({ access: "container" });

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Upload file buffer to blob
    await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: "image/jpeg" }
    });

    return `${blockBlobClient.url}?${AZURE_STORAGE_SAS_TOKEN}`;
};

export const uploadAvatarToAzure = async (fileBuffer, fileName) => {
    const containerClient = blobServiceClient.getContainerClient('avatars');

    // Tạo container 'avatars' nếu chưa tồn tại
    await containerClient.createIfNotExists({ access: "container" });

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Upload file buffer lên blob
    await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: "image/jpeg" }
    });

    return `${blockBlobClient.url}?${AZURE_STORAGE_SAS_TOKEN}`;
};
