import * as argon2 from 'argon2';
import { isEmpty, validate } from 'class-validator';
import { Request, Response, Router } from 'express';
import { User } from '../entities/User';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    // Validate data
    let errors: any = {};
    const emailUser = await User.findOne({ email });
    const usernameUser = await User.findOne({ username });

    if (emailUser) errors.email = 'That email address is already taken';
    if (usernameUser) errors.username = 'That Username is already taken';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }
    // Create user
    const user = new User({ email, username, password });

    errors = await validate(user);
    if (errors.length > 0) return res.status(400).json({ errors });

    await user.save();
    // Return the user
    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    let errors: any = {};

    if (isEmpty(username)) errors.username = 'Username must not be empty';
    if (isEmpty(password)) errors.password = 'Password must not be empty';
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const validPWD = await argon2.verify(user.password, password);

    if (!validPWD) {
      return null;
    }
    // base64 URL safe string gererated at:
    // https://generate.plus/en/base64
    // Also see: https://www.base64encode.org/enc/random/
    const token = jwt.sign({ username }, 'process.env.JWT_SECRET');

    res.set(
      'Set-Cookie',
      cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600, // = 1 hour
        path: '/' // Valid for the whole site. If left black it will only be valid for the login route
      })
    );

    return res.json(user);
  } catch (err) {}
};

const router = Router();
router.post('/register', register);
router.post('/login', login);

export default router;
