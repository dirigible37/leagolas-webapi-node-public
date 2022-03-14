import { Router } from 'express';
import * as PlayerMatchDataCtrl from '../controllers/player-match-data';

const router: Router = Router();

router.get('/', PlayerMatchDataCtrl.handlePlayerDataRequest);

export const PlayerMatchDataRoutes: Router = router;
