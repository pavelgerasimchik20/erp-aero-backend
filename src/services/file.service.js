import fs from "fs/promises";
import path from "path";
import File from "../models/File.js";

class FileService {
  async upload(userId, file) {
    if (!file) {
      throw new Error("File is required");
    }

    const extension = path.extname(file.originalname).replace(".", "").toLowerCase();

    const record = await File.create({
      userId,
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
      size: file.size,
      extension,
    });

    return record;
  }

  async list(userId, { page = 1, listSize = 10 }) {
    const limit = Number(listSize) > 0 ? Number(listSize) : 10;
    const offset = (Number(page) > 0 ? Number(page) - 1 : 0) * limit;

    const { rows, count } = await File.findAndCountAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return {
      items: rows,
      total: count,
      page: Number(page) || 1,
      listSize: limit,
      totalPages: Math.ceil(count / limit) || 1,
    };
  }

  async getById(userId, id) {
    const file = await File.findOne({
      where: { id, userId },
    });

    if (!file) {
      const err = new Error("File not found");
      err.statusCode = 404;
      throw err;
    }

    return file;
  }

  async delete(userId, id) {
    const file = await this.getById(userId, id);

    try {
      await fs.unlink(file.filePath);
    } catch {
      // ignore fs errors, we still remove DB record
    }

    await file.destroy();

    return { success: true };
  }

  async download(userId, id) {
    const file = await this.getById(userId, id);

    file.downloadCount += 1;
    await file.save();

    return file;
  }

  async update(userId, id, newFile) {
    if (!newFile) {
      throw new Error("File is required");
    }

    const file = await this.getById(userId, id);

    // remove old physical file
    try {
      await fs.unlink(file.filePath);
    } catch {
      // ignore
    }

    const extension = path.extname(newFile.originalname).replace(".", "").toLowerCase();

    file.originalName = newFile.originalname;
    file.fileName = newFile.filename;
    file.filePath = newFile.path;
    file.mimeType = newFile.mimetype;
    file.size = newFile.size;
    file.extension = extension;

    await file.save();

    return file;
  }
}

const fileService = new FileService();

export default fileService;


