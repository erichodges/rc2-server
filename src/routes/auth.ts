import * as argon2 from 'argon2';
import { validate } from 'class-validator';
import { Request, Response, Router } from 'express';
import { User } from '../entities/User';

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
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const validPWD = await argon2.verify(user.password, password);

    if (!validPWD) {
      return null;
    }

    return res.json(user);
  } catch (err) {}
};

const router = Router();
router.post('/register', register);
router.post('/login', login);

export default router;
