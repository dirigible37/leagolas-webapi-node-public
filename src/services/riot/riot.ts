import { RIOT_BASE_URL_NA, RIOT_BASE_URL_AMERICAS } from '../../utils/constants';
import {
  GET_SUMMONER_BY_NAME_ENDPOINT,
  GET_MATCH_BY_PUUID_ENDPOINT,
  GET_MATCH_DATA_BY_MATCH_ID_ENDPOINT,
  GET_CLASH_DATA_BY_SUMMONER_ID_ENDPOINT,
  GET_CLASH_TEAM_BY_TEAM_ID_ENDPOINT,
  GET_SUMMONER_BY_ID_ENDPOINT,
  GET_RANK_BY_SUMMONER_ID_ENDPOINT,
  GET_CHAMPION_MASTERIES_BY_SUMMONER_ID_ENDPOINT,
  GET_SUMMONER_BY_PUUID_ENDPOINT,
} from './endpoints';
import {
  checkSummonerDataCacheBySummonerName,
  checkMatchDataCacheByMatchId,
  checkSummonerDataCacheBySummonerId,
  checkSummonerDataCacheByPuuid,
} from '../cache';
import {
  SummonerDto,
  PlayerDto,
  ClashTeamDto,
  LeagueEntryDto,
  ChampionMasteryDto,
  InfoDto,
} from '../../library/interfaces';
import { ChampData, MasteryData, MatchData, RankData, SummonerData } from '../../db/sql/models';
import { makeApiCall } from './api_call_handler';
import { DDragon } from '@fightmegg/riot-api';

export async function getSummonerDtoByName(summonerName: string): Promise<SummonerDto> {
  //Check Cache
  const cachedSummonerData = await checkSummonerDataCacheBySummonerName(summonerName);
  if (cachedSummonerData) {
    return cachedSummonerData;
  }

  //Check API
  const summonerData = (await makeApiCall(
    `${RIOT_BASE_URL_NA}/${GET_SUMMONER_BY_NAME_ENDPOINT}/${summonerName}`
  )) as SummonerDto;

  //Add to db (maybe break this into another service, idk)
  await SummonerData.upsert({
    ...summonerData,
  });

  return summonerData;
}

export async function getSummonerDtoById(summonerId: string): Promise<SummonerDto> {
  //TODO: Merge with above?
  //Check Cache
  const cachedSummonerData = await checkSummonerDataCacheBySummonerId(summonerId);
  if (cachedSummonerData) {
    return cachedSummonerData;
  }

  //Check API
  const summonerData = (await makeApiCall(
    `${RIOT_BASE_URL_NA}/${GET_SUMMONER_BY_ID_ENDPOINT}/${summonerId}`
  )) as SummonerDto;

  //Add to db (maybe break this into another service, idk)
  await SummonerData.upsert({
    ...summonerData,
  });

  return summonerData;
}

export async function getSummonerDtoByPuuid(puuid: string): Promise<SummonerDto> {
  //Check Cache
  const cachedSummonerData = await checkSummonerDataCacheByPuuid(puuid);
  if (cachedSummonerData) {
    return cachedSummonerData;
  }

  //Check API
  const summonerData = (await makeApiCall(
    `${RIOT_BASE_URL_NA}/${GET_SUMMONER_BY_PUUID_ENDPOINT}/${puuid}`
  )) as SummonerDto;

  //Add to db (maybe break this into another service, idk)
  await SummonerData.upsert({
    ...summonerData,
  });

  return summonerData;
}

export async function getRecentMatchesForPuuidByQueue(
  puuid: string,
  queueId: number,
  numberOfMatches = 100
): Promise<InfoDto[]> {
  numberOfMatches = numberOfMatches > 100 ? 100 : numberOfMatches;
  const recentMatchIds = (await makeApiCall(
    `${RIOT_BASE_URL_AMERICAS}/${GET_MATCH_BY_PUUID_ENDPOINT}/${puuid}/ids?start=0&count=${numberOfMatches}&queue=${queueId}`
  )) as string[];

  if (!recentMatchIds) {
    return [];
  }

  const matchDataList: InfoDto[] = [];
  for (const matchId of recentMatchIds) {
    //Check Cache
    const cachedMatchData = await checkMatchDataCacheByMatchId(matchId);
    if (cachedMatchData) {
      matchDataList.push(cachedMatchData);
      continue;
    }

    //Check API
    const matchData: any = await makeApiCall(
      `${RIOT_BASE_URL_AMERICAS}/${GET_MATCH_DATA_BY_MATCH_ID_ENDPOINT}/${matchId}`
    );

    //Add to db (maybe break this into another service, idk)
    await MatchData.upsert({
      ...matchData.info,
      matchId,
    });

    matchDataList.push({ ...matchData.info, matchId });
  }

  return matchDataList;
}

export async function getClashTeamBySummonerId(summonerId: string): Promise<ClashTeamDto> {
  //Check API
  const playerClashDto = (await makeApiCall(
    `${RIOT_BASE_URL_NA}/${GET_CLASH_DATA_BY_SUMMONER_ID_ENDPOINT}/${summonerId}`
  )) as PlayerDto[];

  if (!playerClashDto) {
    return null;
  }

  const clashTeamId = playerClashDto[0].teamId;
  //Check API
  const clashTeamData = (await makeApiCall(
    `${RIOT_BASE_URL_NA}/${GET_CLASH_TEAM_BY_TEAM_ID_ENDPOINT}/${clashTeamId}`
  )) as ClashTeamDto;

  return clashTeamData;
}

export async function getRankDataBySummonerId(summonerId: string): Promise<LeagueEntryDto[]> {
  /*Check Cache
  const cachedSummonerData = await checkSummonerDataCacheBySummonerId(summonerId);
  if (cachedSummonerData) {
    return cachedSummonerData;
  }*/

  //Check API
  const rankData = (await makeApiCall(
    `${RIOT_BASE_URL_NA}/${GET_RANK_BY_SUMMONER_ID_ENDPOINT}/${summonerId}`
  )) as LeagueEntryDto[];

  //Add to db (maybe break this into another service, idk)
  await RankData.bulkCreate(
    {
      ...rankData,
    },
    {
      updateOnDuplicate: ['summonerId'],
    }
  );

  return rankData;
}

export async function getMasteryDataBySummonerId(summonerId: string): Promise<ChampionMasteryDto[]> {
  //Check API
  const masteryData = (await makeApiCall(
    `${RIOT_BASE_URL_NA}/${GET_CHAMPION_MASTERIES_BY_SUMMONER_ID_ENDPOINT}/${summonerId}`
  )) as ChampionMasteryDto[];

  await MasteryData.bulkCreate(
    {
      ...masteryData,
    },
    {
      updateOnDuplicate: ['summonerId'],
    }
  );

  return masteryData;
}

export async function updateChampionsInDatabase() {
  const ddragon = new DDragon();
  const champs = await ddragon.champion.all();
  Object.entries(champs.data).forEach((champData: any) => {
    ChampData.upsert({ ...champData[1] }).catch((error) => console.log(error));
  });
}
