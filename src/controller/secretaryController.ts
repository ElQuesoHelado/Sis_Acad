import { Request, Response } from "express"
import { SecretaryService } from "../service/secretaryService"

export class SecretaryController {
  private secretaryService = new SecretaryService()
  async viewAllStudents(req: Request, res: Response): Promise<void> {
    try {
      const students = await this.secretaryService.viewAllStudents()
      res.json({
        message: "All students retrieved",
        totalCount: students.length,
        students,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
}
