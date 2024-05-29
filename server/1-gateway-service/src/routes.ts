import { Application } from 'express';

import { healthRoutes } from './routes/heath';


//const BASE_PATH = '/api/gateway/v1';

export const appRoutes = (app: Application) => {
  app.use('', healthRoutes.routes());
};
