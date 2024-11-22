import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from 'dotenv';
dotenv.config();

// Chỉ cần sử dụng mỗi connection string là đủ rồi
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error("Azure Storage connection string is not set");
}

// Khởi tạo BlobServiceClient từ connection string đã có SAS token
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

// Hàm upload cho 'notifications' container
export const uploadNotificationsToAzure = async (fileBuffer, fileName, containerName = 'notifications') => {
    const containerClient = blobServiceClient.getContainerClient(containerName);

    await containerClient.createIfNotExists({ access: "container" });

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Upload file buffer to blob
    await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: "image/jpeg" }
    });

    // Trả về URL của blob mà không cần thêm SAS token
    return blockBlobClient.url;
};

// Hàm upload cho 'avatars' container
export const uploadAvatarToAzure = async (fileBuffer, fileName) => {
    const containerClient = blobServiceClient.getContainerClient('avatars');

    await containerClient.createIfNotExists({ access: "container" });

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Upload file buffer lên blob
    await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: "image/jpeg" }
    });

    // Trả về URL của blob mà không cần thêm SAS token
    return blockBlobClient.url;
};

export const deleteFromAzure = async (fileName, containerName ) => {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    try {
        const deleteResponse = await blockBlobClient.deleteIfExists();
        if (deleteResponse.succeeded) {
            console.log(`File ${fileName} successfully deleted from Azure.`);
        } else {
            console.log(`File ${fileName} not found or could not be deleted.`);
        }
    } catch (error) {
        console.error(`Failed to delete file ${fileName} from Azure: ${error.message}`);
    }
};

export const uploadBiometricToAzure = async (fileBuffer, fileName, containerName = 'biometric', subFolder = '') => {
    const containerClient = blobServiceClient.getContainerClient(containerName);

    await containerClient.createIfNotExists({ access: "container" });

    // Thêm subFolder vào đường dẫn nếu có
    const blobName = subFolder ? `${subFolder}/${fileName}` : fileName;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload file buffer lên blob
    await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: "image/jpeg" }
    });

    // Trả về URL của blob mà không cần thêm SAS token
    return blockBlobClient.url;
};

