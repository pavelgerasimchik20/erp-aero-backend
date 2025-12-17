import fileService from "../services/file.service.js";
import { asyncHandler } from "../utils/error.js";

export const uploadFile = asyncHandler(async (req, res) => {
  const file = await fileService.upload(req.userId, req.file);

  res.status(201).json({
    success: true,
    message: "File uploaded successfully",
    data: file,
  });
});

export const listFiles = asyncHandler(async (req, res) => {
  const { page = 1, list_size } = req.query;

  const result = await fileService.list(req.userId, {
    page,
    listSize: list_size || 10,
  });

  res.json({
    success: true,
    data: result,
  });
});

export const getFileInfo = asyncHandler(async (req, res) => {
  const file = await fileService.getById(req.userId, req.params.id);

  res.json({
    success: true,
    data: file,
  });
});

export const deleteFile = asyncHandler(async (req, res) => {
  await fileService.delete(req.userId, req.params.id);

  res.json({
    success: true,
    message: "File deleted successfully",
  });
});

export const downloadFile = asyncHandler(async (req, res) => {
  const file = await fileService.download(req.userId, req.params.id);

  res.download(file.filePath, file.originalName);
});

export const updateFile = asyncHandler(async (req, res) => {
  const file = await fileService.update(req.userId, req.params.id, req.file);

  res.json({
    success: true,
    message: "File updated successfully",
    data: file,
  });
});


