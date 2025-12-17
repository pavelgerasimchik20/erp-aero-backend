import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate } from "../middleware/auth.js";
import {
  uploadFile,
  listFiles,
  getFileInfo,
  deleteFile,
  downloadFile,
  updateFile,
} from "../controllers/file.controller.js";

const router = Router();

const uploadsDir = path.resolve("uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

// POST /file/upload
router.post("/upload", authenticate, upload.single("file"), uploadFile);

// GET /file/list
router.get("/list", authenticate, listFiles);

// DELETE /file/delete/:id
router.delete("/delete/:id", authenticate, deleteFile);

// GET /file/:id
router.get("/:id", authenticate, getFileInfo);

// GET /file/download/:id
router.get("/download/:id", authenticate, downloadFile);

// PUT /file/update/:id
router.put(
  "/update/:id",
  authenticate,
  upload.single("file"),
  updateFile,
);

export default router;


