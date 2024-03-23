import { Router } from "express";
import taskRoutes from './task/task.routes';
import authRoutes from './auth/auth.routes';

const routes = Router();

routes.use('/task', taskRoutes);
routes.use('/auth', authRoutes);

routes.use('/task', taskRoutes);

export default routes;