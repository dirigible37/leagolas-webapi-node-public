import { ClashTeamDto, InfoDto, PlayerData } from '../../library/interfaces';
import {
  getRankDataBySummonerId,
  getRecentMatchesForPuuidByQueue,
  getSummonerDtoByName,
  getMasteryDataBySummonerId,
  getClashTeamBySummonerId,
  getSummonerDtoById,
  getSummonerDtoByPuuid,
} from '../../services/riot';
import { Request, Response } from 'express';
import { default as sequelize } from 'sequelize';
import {
  getAggregateStatsFromMatchList,
  getChampDataFromMatchList,
  getRelevantMasteryDataFromRawMasteryData,
  getRelevantMatchHistoryDataFromMatchList,
} from '../../utils/matchDataProcessing';
import { PlayerDataCache, RoomCodes } from '../../db/sql/models';
import { checkPlayerDataCache } from '../../services/cache';

export async function getClashTeamPlayers(summonerName: string): Promise<ClashTeamDto> {
  const summoner = await getSummonerDtoByName(summonerName);
  const clashTeam = await getClashTeamBySummonerId(summoner.id);

  if (!clashTeam?.players) {
    return null;
  }
  const players = [];
  for (const player of clashTeam.players) {
    players.push((await getSummonerDtoById(player.summonerId)).name);
  }
  clashTeam.playerNames = players;
  return clashTeam;
}

export async function getPlayerDataBySummonerName(summonerName: string) {
  const rankData = { flexRank: '', soloRank: '' };
  const summoner = await getSummonerDtoByName(summonerName);
  const cachedPlayerData = await checkPlayerDataCache(summoner.puuid);
  const cacheCutoff = new Date();
  cacheCutoff.setDate(cacheCutoff.getDate() - 1);
  if (cachedPlayerData && cachedPlayerData.updatedAt > cacheCutoff) {
    return cachedPlayerData.playerData;
  }

  const clashRole = (await getClashTeamBySummonerId(summoner.id))?.players.find(
    (player) => player.summonerId === summoner.id
  )?.role;

  const rankedData = await getRankDataBySummonerId(summoner.id);
  rankedData?.forEach((rankForQueue) => {
    if (rankForQueue.queueType === 'RANKED_FLEX_SR') {
      rankData.flexRank = rankForQueue.tier + ' ' + rankForQueue.rank;
    } else if (rankForQueue.queueType === 'RANKED_SOLO_5x5') {
      rankData.soloRank = rankForQueue.tier + ' ' + rankForQueue.rank;
    }
  });

  const matchList: InfoDto[] = [];
  /*  400: 'Draft', 420: 'Solo/Duo', 440: 'Flex', 700: 'Clash' */
  for (const queueId of [440, 400, 700, 420]) {
    const queueList = await getRecentMatchesForPuuidByQueue(summoner.puuid, queueId, 25);
    matchList.push(...queueList);
  }
  const { kda, winrate, PositionPercentagesAndWinrate } = getAggregateStatsFromMatchList(matchList, summoner.puuid);

  const rawMasteryData = await getMasteryDataBySummonerId(summoner.id);

  const clashChamps = getChampDataFromMatchList(
    matchList.filter((match) => match.queueId === 700),
    rawMasteryData,
    summoner.puuid
  );

  const rankedChamps = getChampDataFromMatchList(
    matchList.filter((match) => match.queueId === 420 || match.queueId === 440),
    rawMasteryData,
    summoner.puuid
  );

  const recentChamps = getChampDataFromMatchList(matchList, rawMasteryData, summoner.puuid);

  const masteryData = await getRelevantMasteryDataFromRawMasteryData(rawMasteryData, matchList, summoner.puuid);

  const matchHistory = getRelevantMatchHistoryDataFromMatchList(matchList, rawMasteryData, summoner.puuid);

  const playerData: PlayerData = {
    ...rankData,
    playerName: summoner.name,
    clashRole: clashRole,
    kda: +kda.toFixed(2),
    winrate: +winrate.toFixed(2),
    positionPercentages: PositionPercentagesAndWinrate,
    clashChamps: clashChamps,
    rankedChamps: rankedChamps,
    recentChamps: recentChamps,
    masteryChamps: masteryData,
    matchHistory: matchHistory,
  };

  if (cachedPlayerData) {
    /**@todo should I add new player data, or replace? */
    await PlayerDataCache.update(
      {
        playerData: playerData,
        updatedAt: new Date(),
      },
      { where: { summonerPuuid: summoner.puuid } }
    );
  } else {
    await PlayerDataCache.create({
      summonerPuuid: summoner.puuid,
      playerData: playerData,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
  }

  return playerData;
}

function generateRoomCode() {
  const length = 4;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;

  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export async function handlePlayerDataRequest(req: Request, res: Response): Promise<Response> {
  // { playerName: 'The Beast', roomCode: 'FE3K', oldPlayerName: 'Heiena' }
  try {
    /**@todo if we get a room code and no player name, return all player data for the team */
    let summonerName = '';
    if (req.query.playerName) {
      summonerName = req.query.playerName as string;
    }
    let roomCode = '';
    if (req.query.roomCode) {
      roomCode = req.query.roomCode as string;
      if (!summonerName) {
        const roomCodeData = await RoomCodes.findOne({ where: { roomCodeId: roomCode } });
        const roomCodePlayerData: PlayerData[] = [];
        for (const playerPuuid of roomCodeData.playerPuuids) {
          const summonerData = await getSummonerDtoByPuuid(playerPuuid);
          const playerData = await getPlayerDataBySummonerName(summonerData.name);
          roomCodePlayerData.push(playerData);
        }
        return res.json({ success: true, roomCode, playerData: roomCodePlayerData });
      }

      if (req.query.oldPlayerName) {
        const oldSummoner = await getSummonerDtoByName(req.query?.oldPlayerName as string);
        const newSummoner = await getSummonerDtoByName(summonerName);
        //replace old player with new player
        await RoomCodes.update(
          { playerPuuids: sequelize.fn('array_remove', sequelize.col('player_puuids'), oldSummoner.puuid) },
          { where: { roomCodeId: roomCode } }
        );
        await RoomCodes.update(
          { playerPuuids: sequelize.fn('array_append', sequelize.col('player_puuids'), newSummoner.puuid) },
          { where: { roomCodeId: roomCode } }
        );
      } else {
        //add player to room roomCode
        const summoner = await getSummonerDtoByName(summonerName);
        const roomCodeData = await RoomCodes.findOne({ where: { roomCodeId: roomCode } });
        if (
          !roomCodeData.playerPuuids.find((puuid) => puuid === summoner.puuid) &&
          roomCodeData.playerPuuids.length < 5
        ) {
          await RoomCodes.update(
            { playerPuuids: sequelize.fn('array_append', sequelize.col('player_puuids'), summoner.puuid) },
            { where: { roomCodeId: roomCode } }
          );
        }
      }

      const playerData = await getPlayerDataBySummonerName(summonerName);
      return res.json({ success: true, roomCode, playerData });
    } else {
      roomCode = generateRoomCode();
      /**@todo handle collisions */
      const summoner = await getSummonerDtoByName(summonerName);
      await RoomCodes.create({ roomCodeId: roomCode, playerPuuids: [summoner.puuid] });
      const clashData = await getClashTeamPlayers(summonerName);
      if (clashData) {
        return res.json({ success: true, roomCode, clashData });
      } else {
        const playerData = await getPlayerDataBySummonerName(summonerName);
        return res.json({ success: true, roomCode, playerData });
      }
    }
  } catch (err) {
    res.status(418).json({
      success: false,
      msg: 'We ran into an error, try again plz',
      error: err,
    });
  }
}
