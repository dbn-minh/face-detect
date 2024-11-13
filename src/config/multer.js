import multer from 'multer';

const photoUpload = multer({
    storage: multer.memoryStorage(),  // Sử dụng memoryStorage để lưu ảnh vào bộ nhớ tạm thời
    limits: { fileSize: 5 * 1024 * 1024 },  // Giới hạn kích thước file là 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(file.originalname.toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'));
        }
    }
});

export default photoUpload;





// import multer from 'multer';
// import path from 'path';
//
// const createMulterMiddleware = (destinationFolder) => {
//     const storage = multer.diskStorage({
//         destination: (req, file, cb) => {
//             cb(null, destinationFolder);  // Sử dụng thư mục đích từ tham số
//         },
//         filename: (req, file, cb) => {
//             const timestamp = Date.now();
//             const extname = path.extname(file.originalname).toLowerCase();
//             cb(null, `${timestamp}-${file.originalname}`);
//         }
//     });
//
//     return multer({
//         storage: storage,
//         limits: { fileSize: 5 * 1024 * 1024 },  // Giới hạn kích thước file 5MB
//         fileFilter: (req, file, cb) => {
//             const filetypes = /jpeg|jpg|png/;
//             const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//             const mimetype = filetypes.test(file.mimetype);
//
//             if (extname && mimetype) {
//                 cb(null, true);
//             } else {
//                 cb(new Error('Only images are allowed!'));
//             }
//         }
//     });
// };
//
// export default createMulterMiddleware;
