import { ChampData, MatchData, PlayerDataCache, SummonerData } from '../../db/sql/models';

export async function checkSummonerDataCacheBySummonerName(summonerName: string) {
  return await SummonerData.findOne({ where: { name: summonerName } });
}

export async function checkSummonerDataCacheBySummonerId(summonerId: string) {
  //TODO: Gotta check last update date against threshold
  return await SummonerData.findOne({ where: { id: summonerId } });
}

export async function checkSummonerDataCacheByPuuid(puuid: string) {
  //TODO: Gotta check last update date against threshold
  return await SummonerData.findOne({ where: { puuid: puuid } });
}

export async function checkPlayerDataCache(puuid: string) {
  //TODO: Gotta check last update date against threshold
  return await PlayerDataCache.findOne({ where: { summonerPuuid: puuid } });
}

export async function checkMatchDataCacheByMatchId(matchId: string) {
  return await MatchData.findOne({ where: { matchId: matchId } });
}

//TODO: This is sort of a weird place for this?
export async function getChampionNameFromChampionId(championId: number) {
  /**@todo handle new champion making api fail */
  return (await ChampData.findOne({ where: { key: championId.toString() } })).name;
}
