import { Router } from "express";
import taskRoutes from './task/task.routes';
import authRoutes from './auth/auth.routes';

const routes = Router();

routes.use('/tasks', taskRoutes);
routes.use('/auth', authRoutes);

export default routes;
