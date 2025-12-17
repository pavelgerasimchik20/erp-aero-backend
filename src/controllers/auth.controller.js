import {
  logout as _logout,
  signin as _signin,
  signup as _signup,
  getUserInfo,
  refreshTokens,
} from "../services/auth.service.js";

class AuthController {
  async signup(req, res, next) {
    try {
      const result = await _signup(req.body, req);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: error.message
        });
      }
      
      if (error.message.includes('must be provided')) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: error.message
        });
      }
      
      next(error);
    }
  }

  async signin(req, res, next) {
    try {
      const result = await _signin(req.body, req);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      if (error.message.includes('Invalid credentials') || 
          error.message.includes('deactivated')) {
        return res.status(401).json({
          success: false,
          error: 'Authentication Failed',
          message: error.message
        });
      }
      
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const result = await refreshTokens(req.body.refreshToken, req);
      
      res.json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: result
      });
    } catch (error) {
      if (error.message.includes('Invalid') || 
          error.message.includes('expired') ||
          error.message.includes('not found') ||
          error.message.includes('revoked')) {
        return res.status(401).json({
          success: false,
          error: 'Token Refresh Failed',
          message: error.message
        });
      }
      
      next(error);
    }
  }

  async getInfo(req, res, next) {
    try {
      const user = await getUserInfo(req.userId);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // req.tokenJti устанавливается в middleware authenticate
      await _logout(req.userId, req.tokenJti);
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

const authController = new AuthController();

export const signup = authController.signup.bind(authController);
export const signin = authController.signin.bind(authController);
export const refreshToken = authController.refreshToken.bind(authController);
export const getInfo = authController.getInfo.bind(authController);
export const logout = authController.logout.bind(authController);

export default authController;