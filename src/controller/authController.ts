import { Request, Response } from "express";
import { AuthenticationService } from "../service/authService";

export class AuthController {
  private authService = new AuthenticationService();

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
      return;
    }

    try {
      const user = await this.authService.authenticate(email, password);

      if (!user) {
        res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          message: "Login successful",
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          }
        }
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "An internal server error occurred.",
      });
    }
  };
}
