import { Application } from 'express';
import {authRoutes} from '@gateway/routes/auth';
import {authMiddleware} from '@gateway/services/auth-middleware';
import {currentUserRoutes} from '@gateway/routes/current-user';
import {buyerRoutes} from '@gateway/routes/buyer';
import {sellerRoutes} from '@gateway/routes/seller';

import { healthRoutes } from './routes/heath';


const BASE_PATH = '/api/gateway/v1';

export const appRoutes = (app: Application) => {
  app.use('', healthRoutes.routes());
  app.use(BASE_PATH, authRoutes.routes());

  app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
  app.use(BASE_PATH, authMiddleware.verifyUser, buyerRoutes.routes());
  app.use(BASE_PATH, authMiddleware.verifyUser, sellerRoutes.routes());
};
