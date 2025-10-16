import { Request, Response } from "express";
import { SecretaryService } from "../service/secretaryService";

export class SecretaryController {
  private secretaryService = new SecretaryService();

  viewAllStudents = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, pageSize = 10 } = req.body;

      const {
        data,
        total,
        page: currentPage,
        lastPage,
      } = await this.secretaryService.viewAllStudents(page, pageSize);

      res.status(200).json({
        success: true,
        message: "Students retrieved successfully.",
        data: {
          students: data,
          meta: {
            total,
            currentPage,
            lastPage,
            perPage: pageSize,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "An internal server error occurred.",
      });
    }
  };
}
