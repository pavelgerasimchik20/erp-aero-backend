import { Router } from "express";
import {
  signup,
  signin,
  refreshToken,
  getInfo,
  logout,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate, authValidation } from "../utils/validation.js";

const router = Router();

// dont need authentication routes
router.post('/signup', validate(authValidation.signup), signup);
router.post('/signin', validate(authValidation.signin), signin);
router.post('/signin/new_token', validate(authValidation.refreshToken), refreshToken);

// routes wtih autentication
router.get('/info', authenticate, getInfo);
router.get('/logout', authenticate, logout);

export default router;