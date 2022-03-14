import { ChampData, ChampionMasteryDto, InfoDto, MatchHistoryData } from '../library/interfaces';
import { getChampionNameFromChampionId } from '../services/cache';
import { QueueIdMaps, PositionMaps } from '../library/mappers';

export function getChampDataFromMatchList(matchList: InfoDto[], masteryData: ChampionMasteryDto[], puuid: string) {
  const champData: ChampData[] = [];
  const participantMatchData = matchList.map((match) => {
    return match.participants.find((participant) => participant.puuid === puuid);
  });

  const playCounts: any = {};
  const wins: any = {};

  //TODO: this is bad
  participantMatchData.forEach((match) => {
    playCounts[match.championId] = playCounts[match.championId] ? playCounts[match.championId] + 1 : 1;
    wins[match.championId] = match.championId in wins ? (wins[match.championId] + match.win ? 1 : 0) : 0;
  });

  participantMatchData.forEach((match) => {
    champData.push({
      champion: match.championName,
      position: match.individualPosition,
      playCount: playCounts[match.championId],
      points: masteryData.find((mastery) => mastery.championId === match.championId).championPoints,
      kda: +((match.kills + match.assists) / (match.deaths || 1)).toFixed(2),
      winrate: +(wins[match.championId] / (playCounts[match.championId] || 1)).toFixed(2) * 100,
    });
  });

  return champData;
}

export function getAggregateStatsFromMatchList(matchList: InfoDto[], puuid: string) {
  let kills = 0;
  let assists = 0;
  let deaths = 0;
  let wins = 0;
  let total = 0;

  //TODO: lol any rip
  const PositionPercentagesAndWinrate: any = {
    Top: { winrate: 0, percentage: 0 },
    Jungle: { winrate: 0, percentage: 0 },
    Mid: { winrate: 0, percentage: 0 },
    Adc: { winrate: 0, percentage: 0 },
    Support: { winrate: 0, percentage: 0 },
    Invalid: { winrate: 0, percentage: 0 },
  };

  matchList.forEach((match) => {
    const participant = match.participants.find((participant) => participant.puuid === puuid);
    kills += participant.kills;
    assists += participant.assists;
    deaths += participant.deaths;
    wins += participant.win ? 1 : 0;
    total += 1;

    //TODO: This is kinda weird
    const pos = participant.individualPosition as keyof typeof PositionMaps;
    const position = PositionMaps[pos];

    PositionPercentagesAndWinrate[position].winrate += participant.win ? 1 : 0;
    PositionPercentagesAndWinrate[position].percentage += 1;
  });

  for (const position in PositionPercentagesAndWinrate) {
    PositionPercentagesAndWinrate[position].winrate =
      +(PositionPercentagesAndWinrate[position].winrate / total).toFixed(2) * 100;
    PositionPercentagesAndWinrate[position].percentage =
      +(PositionPercentagesAndWinrate[position].percentage / total).toFixed(2) * 100;
  }

  return {
    kda: (kills + assists) / (deaths || 1),
    winrate: (wins * 100) / (total || 1),
    PositionPercentagesAndWinrate,
  };
}

export function getRelevantMatchHistoryDataFromMatchList(
  matchList: InfoDto[],
  masteryData: ChampionMasteryDto[],
  puuid: string
): MatchHistoryData[] {
  const matchHistory = matchList.map((match) => {
    const participant = match.participants.find((participant) => participant.puuid === puuid);

    //TODO: This is kinda weird
    const posKey = participant.individualPosition as keyof typeof PositionMaps;
    const queueKey = match.queueId as keyof typeof QueueIdMaps;
    return {
      k: participant.kills,
      d: participant.deaths,
      a: participant.assists,
      kda: +((participant.kills + participant.assists) / (participant.deaths || 1)).toFixed(2),
      champion: participant.championName,
      matchId: match.gameId,
      points: masteryData.find((mastery) => mastery.championId === participant.championId).championPoints,
      position: PositionMaps[posKey],
      queueType: QueueIdMaps[queueKey],
      won: participant.win,
    };
  });
  return matchHistory;
}

export async function getRelevantMasteryDataFromRawMasteryData(
  rawMasteryData: ChampionMasteryDto[],
  matchList: InfoDto[],
  puuid: string
): Promise<ChampData[]> {
  const participantMatchData = matchList.map((match) => {
    return match.participants.find((participant) => participant.puuid === puuid);
  });

  const masteryData = Promise.all(
    rawMasteryData.map(async (mastery) => {
      const gamesWithChampion = participantMatchData.filter(
        (participant) => participant.championId === mastery.championId
      );
      const kills = gamesWithChampion.reduce((previousValue, currentGame) => {
        return previousValue + currentGame.kills;
      }, 0);
      const deaths =
        gamesWithChampion.reduce((previousValue, currentGame) => {
          return previousValue + currentGame.deaths;
        }, 0) || 1;
      const assists = gamesWithChampion.reduce((previousValue, currentGame) => {
        return previousValue + currentGame.assists;
      }, 0);
      const wins = gamesWithChampion.reduce((previousValue, currentGame) => {
        return previousValue + (currentGame.win ? 1 : 0);
      }, 0);
      const losses =
        gamesWithChampion.reduce((previousValue, currentGame) => {
          return previousValue + (currentGame.win ? 0 : 1);
        }, 0) || 1;
      const championName = await getChampionNameFromChampionId(mastery.championId);

      return {
        champion: championName,
        kda: +((kills + assists) / deaths).toFixed(2) || 0,
        playCount: gamesWithChampion.length,
        points: rawMasteryData.find((rawMastery) => rawMastery.championId === mastery.championId).championPoints,
        winrate: +(wins / (wins + losses)).toFixed(2) * 100 || 0,
      };
    })
  );

  return masteryData;
}
