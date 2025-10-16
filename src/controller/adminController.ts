import { Request, Response } from "express"
import { AdminService } from "../service/adminService"

export class AdminController {
  private adminService = new AdminService()
  async viewAllTeachers(req: Request, res: Response): Promise<void> {
    try {
      const teachers = await this.adminService.viewAllTeachers()
      res.json({
        message: "All teachers retrieved",
        totalCount: teachers.length,
        teachers,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
}