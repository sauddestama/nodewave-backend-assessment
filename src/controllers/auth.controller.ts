import { Request, Response } from 'express';
import authService, { RegisterData, LoginData } from '../services/auth.service';
import { response_success, response_created, response_bad_request, response_conflict, response_unauthorized, response_internal_server_error } from '../utils/response.utils';

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { fullName, email, password, role }: RegisterData = req.body;

      if (!fullName || !email || !password) {
        return response_bad_request(res, 'Full name, email, and password are required');
      }

      if (password.length < 6) {
        return response_bad_request(res, 'Password must be at least 6 characters long');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return response_bad_request(res, 'Please provide a valid email address');
      }

      const result = await authService.register({
        fullName,
        email: email.toLowerCase(),
        password,
        role
      });

      return response_created(res, result, 'User registered successfully');
    } catch (error: any) {
      if (error.message === 'User already exists with this email') {
        return response_conflict(res, error.message);
      }
      return response_internal_server_error(res, 'Registration failed');
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginData = req.body;

      if (!email || !password) {
        return response_bad_request(res, 'Email and password are required');
      }

      const result = await authService.login({
        email: email.toLowerCase(),
        password
      });

      return response_success(res, result, 'Login successful');
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        return response_unauthorized(res, error.message);
      }
      return response_internal_server_error(res, 'Login failed');
    }
  }
}

export default new AuthController();