"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Define the base uploads path and subfolders
const uploadsPath = path_1.default.join(__dirname, "../../uploads");
console.log(__dirname, uploadsPath, "fileupload");
const subDirectories = {
    image: "image",
    profileImage: "profile_img",
    postImage: "post_img",
    coverImage: "image", // or "cover_img" if you want a dedicated folder
    resume: "documents", // or "resume" if you want a dedicated folder
};
// Ensure the main uploads folder exists
if (!fs_1.default.existsSync(uploadsPath)) {
    fs_1.default.mkdirSync(uploadsPath);
    console.log("Created 'uploads' directory");
}
// Ensure all subfolders exist
Object.values(subDirectories).forEach((subDir) => {
    const dirPath = path_1.default.join(uploadsPath, subDir);
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
        console.log(`Created sub-directory ${subDir}`);
    }
});
// Setup dynamic storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const folderKey = file.fieldname;
        const subDir = subDirectories[folderKey];
        if (!subDir)
            return cb(new Error("Unknown upload type"), "");
        const finalPath = path_1.default.join(uploadsPath, subDir);
        cb(null, finalPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// File filter: Optional, customize per file type
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        image: ["image/jpeg", "image/png", "image/jpg"],
        profileImage: ["image/jpeg", "image/png", "image/jpg"],
        postImage: ["image/jpeg", "image/png", "image/jpg"],
        coverImage: ["image/jpeg", "image/png", "image/jpg"],
        resume: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
    };
    const allowed = allowedTypes[file.fieldname];
    if (allowed?.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Invalid file type for ${file.fieldname}`));
    }
};
// Final uploader
const fileUploads = (0, multer_1.default)({
    storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760") }, // 10 * 1024 * 1024 = 10485760
    fileFilter,
});
exports.default = fileUploads;
// usage
// Use `.single("fieldname")` or `.fields([{ name: "image" }, { name: "resume" }])` depending on the use case
// import upload from '../../middleware/upload.js';
// const createResume = (req, res) => {
//   upload.single("resume")(req, res, async (err) => {
//     if (err) return res.status(400).json({ message: err.message });
//     console.log("Uploaded resume:", req.file);
//     res.status(201).json({ message: "Resume uploaded successfully" });
//   });
//   upload.fields([
//     { name: "resume", maxCount: 1 },
//     { name: "image", maxCount: 1 },
//   ])(req, res, async (err) => {
//     if (err) return res.status(400).json({ message: err.message });
//     console.log("Files uploaded:", req.files);
//     res.status(201).json({ message: "Files uploaded successfully" });
//   });
// };
