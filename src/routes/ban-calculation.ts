import { Router } from 'express';
import * as BanCalculationCtrl from '../controllers/ban-calculation';

const router: Router = Router();

router.get('/', BanCalculationCtrl.getBanData);

export const BanCalculationRoutes: Router = router;
