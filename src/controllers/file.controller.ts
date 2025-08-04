import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../utils/prisma.utils';
import { response_success, response_created, response_bad_request, response_unauthorized, response_not_found, response_internal_server_error } from '../utils/response.utils';
import backgroundJobService from '../services/backgroundJob.service';
import { buildFilterQueryLimitOffsetV2 } from '../services/helpers/FilterQueryV2';
import fs from 'fs';
import path from 'path';

class FileController {
  async upload(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.file) {
        return response_bad_request(res, 'No file uploaded');
      }

      if (!req.user) {
        return response_unauthorized(res, 'User not authenticated');
      }

      const fileUpload = await prisma.fileUpload.create({
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          uploadedBy: req.user.id,
          status: 'pending'
        }
      });

      backgroundJobService.startFileProcessing(fileUpload.id, req.file.path);

      return response_created(res, {
        id: fileUpload.id,
        filename: fileUpload.filename,
        originalName: fileUpload.originalName,
        status: fileUpload.status,
        createdAt: fileUpload.createdAt
      }, 'File uploaded successfully and processing started');
    } catch (error) {
      console.error('Upload error:', error);
      return response_internal_server_error(res, 'Upload failed');
    }
  }

  async getFiles(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return response_unauthorized(res, 'User not authenticated');
      }

      const queryResult = buildFilterQueryLimitOffsetV2({
        filters: req.query.filters ? JSON.parse(req.query.filters as string) : {},
        searchFilters: req.query.searchFilters ? JSON.parse(req.query.searchFilters as string) : {},
        rangedFilters: req.query.rangedFilters ? JSON.parse(req.query.rangedFilters as string) : [],
        page: parseInt(req.query.page as string) || 1,
        rows: parseInt(req.query.rows as string) || 10,
        orderKey: (req.query.orderKey as string) || 'createdAt',
        orderRule: (req.query.orderRule as string) || 'desc'
      });

      const baseFilters = {
        ...queryResult.where,
        AND: [
          ...(queryResult.where.AND || []),
          { uploadedBy: req.user.id }
        ]
      };

      const [files, totalCount] = await Promise.all([
        prisma.fileUpload.findMany({
          ...queryResult,
          where: baseFilters,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            },
            _count: {
              select: {
                sampleData: true
              }
            }
          }
        }),
        prisma.fileUpload.count({
          where: baseFilters
        })
      ]);

      const totalPages = Math.ceil(totalCount / queryResult.take);
      const currentPage = Math.floor(queryResult.skip / queryResult.take) + 1;

      return response_success(res, {
        files,
        pagination: {
          currentPage,
          totalPages,
          totalCount,
          pageSize: queryResult.take
        }
      }, 'Files retrieved successfully');
    } catch (error) {
      console.error('Get files error:', error);
      return response_internal_server_error(res, 'Failed to retrieve files');
    }
  }

  async getFileById(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return response_unauthorized(res, 'User not authenticated');
      }

      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return response_bad_request(res, 'Invalid file ID');
      }

      const file = await prisma.fileUpload.findFirst({
        where: {
          id: fileId,
          uploadedBy: req.user.id
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          sampleData: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!file) {
        return response_not_found(res, 'File not found');
      }

      return response_success(res, file, 'File details retrieved successfully');
    } catch (error) {
      console.error('Get file by ID error:', error);
      return response_internal_server_error(res, 'Failed to retrieve file details');
    }
  }

  async deleteFile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return response_unauthorized(res, 'User not authenticated');
      }

      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return response_bad_request(res, 'Invalid file ID');
      }

      const file = await prisma.fileUpload.findFirst({
        where: {
          id: fileId,
          uploadedBy: req.user.id
        }
      });

      if (!file) {
        return response_not_found(res, 'File not found');
      }

      await prisma.fileUpload.delete({
        where: { id: fileId }
      });

      try {
        const filePath = path.join('uploads', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error('Failed to cleanup physical file:', cleanupError);
      }

      return response_success(res, null, 'File deleted successfully');
    } catch (error) {
      console.error('Delete file error:', error);
      return response_internal_server_error(res, 'Failed to delete file');
    }
  }
}

export default new FileController();