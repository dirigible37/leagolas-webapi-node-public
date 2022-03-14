import { Request, Response } from 'express';
import { getPlayerDataBySummonerName } from '../player-match-data';
import { ChampData, BanScoreData, ChampDataLists, BanData, PlayerData } from '../../library/interfaces';
import {
  GAREN_CHAMPS,
  GAREN_COEFFICIENT_MANUAL_ADJUSTMENT,
  KDA_COEFFICIENT,
  MATCH_TYPE_ADJUSTMENTS,
  RANKED_DIVISION_SCORES,
  RANKED_TIER_SCORES,
  WINRATE_COEFFICIENT,
} from '../../library/helpers/ban-calculation/coefficients';
import { RoomCodes } from '../../db/sql/models';
import { getSummonerDtoByPuuid } from '../../services/riot';
import { checkPlayerDataCache } from '../../services/cache';

export async function getBanData(req: Request, res: Response): Promise<Response> {
  try {
    let summonerPuuids: string[] = [];
    if (req.query.roomCode) {
      const roomCodeData = await RoomCodes.findOne({ where: { room_code_id: req.query.roomCode } });
      summonerPuuids = roomCodeData.playerPuuids;
    } else {
      return res.status(400).json({
        success: false,
        msg: 'roomCode parameter not supplied',
      });
    }

    const banData: BanData = { local_scoring: {}, global_scoring: [] };
    let maxGlobalScore = -1;
    for (const summonerPuuid of summonerPuuids) {
      const cachedPlayerData = await checkPlayerDataCache(summonerPuuid);
      const cacheCutoff = new Date();
      cacheCutoff.setDate(cacheCutoff.getDate() - 1);

      let playerData: PlayerData;
      /**Pull data from cache, or get new player data */
      if (cachedPlayerData && cachedPlayerData.updatedAt > cacheCutoff) {
        playerData = cachedPlayerData.playerData;
      } else {
        const summonerData = await getSummonerDtoByPuuid(summonerPuuid);
        playerData = await getPlayerDataBySummonerName(summonerData.name);
      }

      const maxPlayCount = playerData.masteryChamps.reduce((previousValue, currentValue) => {
        return Math.max(previousValue, currentValue.playCount);
      }, 0);

      let maxLocalScore = -1;
      playerData.masteryChamps.forEach((champ) => {
        ['clash', 'recent', 'ranked', 'mastery'].forEach((champDataType) => {
          const scoreToCalc = (champDataType + 'Score') as keyof BanScoreData;
          const champDataToCalc = (champDataType + 'Champs') as keyof ChampDataLists;
          const dataForChamp = playerData[champDataToCalc].filter(
            (playerChampData) => playerChampData.champion === champ.champion
          );
          const adjustmentDataToCalc = (champDataType + 'Champs') as keyof typeof MATCH_TYPE_ADJUSTMENTS;
          champ[scoreToCalc] =
            calcQueueTypeScore(dataForChamp, MATCH_TYPE_ADJUSTMENTS[adjustmentDataToCalc], maxPlayCount) || 0;
        });

        const localScoreCoefficient = GAREN_CHAMPS.includes(champ.champion) ? GAREN_COEFFICIENT_MANUAL_ADJUSTMENT : 1;
        champ.localScore =
          (champ.clashScore + champ.recentScore + champ.rankedScore + champ.masteryScore) * localScoreCoefficient;

        const tier = playerData.soloRank?.split(' ')[0] ?? playerData.flexRank?.split(' ')[0] ?? 'UNRANKED';
        const division = playerData.soloRank?.split(' ')[1] ?? playerData.flexRank?.split(' ')[1] ?? 'UNRANKED';
        const tierScore = RANKED_TIER_SCORES[tier] || 1;
        const divisionScore = RANKED_DIVISION_SCORES[division] || 1;
        champ.globalScore = champ.localScore * tierScore * divisionScore;

        maxLocalScore = Math.max(maxLocalScore, champ.localScore);
        maxGlobalScore = Math.max(maxGlobalScore, champ.globalScore);
        champ.playerName = playerData.playerName;
      });

      playerData.masteryChamps.forEach((champ) => {
        champ.scaledLocalScore = +((1000 * champ.localScore) / maxLocalScore).toFixed(2);
      });

      playerData.masteryChamps.sort((a, b) => b.localScore - a.localScore);
      banData.local_scoring[playerData.playerName] = playerData.masteryChamps;
      banData.global_scoring.push(...playerData.masteryChamps);
    }

    banData.global_scoring.forEach((champ: ChampData) => {
      champ.scaledGlobalScore = +((1000 * champ.globalScore) / maxGlobalScore).toFixed(2);
    });
    banData.global_scoring.sort((a: ChampData, b: ChampData) => b.globalScore - a.globalScore);
    return res.json(banData);
  } catch (err) {
    res.status(418).send('Rip Derek: ' + err);
  }
}

function calcQueueTypeScore(champGameData: ChampData[], adjustment: number, maxPlayCount: number) {
  if (!champGameData.length || champGameData[0].playCount === 0) {
    return 0;
  }
  console.log('🚀 ~ file: index.ts ~ line 101 ~ calcQueueTypeScore ~ champGameData.length', champGameData.length);
  console.log('🚀 ~ file: index.ts ~ line 104 ~ calcQueueTypeScore ~ champGameData', champGameData);
  let score = 0;
  let playCount = 0;
  let kda = 0;
  let points = 0;
  let winrate = -1;
  champGameData.forEach((currentGame) => {
    playCount = playCount + 1;
    kda = (currentGame.kda + kda * playCount) / playCount;
    winrate = winrate > -1 ? currentGame.winrate : currentGame.winrate / (currentGame.playCount || 1);
    points = currentGame.points;
  });
  const playCountScore = 1 + playCount / maxPlayCount;
  const kdaScore = kda === 0 ? 0 : (1 + 1 - 1 / kda) * KDA_COEFFICIENT;
  const winrateScore = (1 + winrate / 100) * WINRATE_COEFFICIENT;

  score = playCountScore * kdaScore * winrateScore * adjustment * (1 + 1 / (1 - points));
  return score;
}
