import axios from 'axios';

const latestLeagueId = "920114615076380672" //todo: automate this

async function countTrades() {
  const leagues = await getLeaguesByYear()
  const res = {}
  for(let i = 0; i < leagues.length; i++) {
    let league = leagues[i]
    res[league.season] = await countTradesForLeague(league.leagueId)
  }
  console.log(res)
}

async function countTradesForLeague(leagueId) {
  const league = await getLeague(leagueId)
  // todo: log legs? 
  const playoffWeek = league.settings.playoff_week_start
  const start = 1
  const end = playoffWeek + 2

  let tradeCount = 0
  for (let i = 0; i <= end; i++) {
    const trades = await getTradesForWeek(leagueId, i)
    tradeCount += trades.length
  }  
  return tradeCount
}

async function getTradesForWeek(leagueId, week) {
  const transactionUrl = "https://api.sleeper.app/v1/league/" + leagueId + "/transactions/" + week;
  const res = (await axios.get(transactionUrl)).data;
  return res.filter(t => t.type == "trade")
}

async function getLeaguesByYear() {
  let currentLeague = await getLeague(latestLeagueId)
  const record = [{leagueId: currentLeague.league_id, season: currentLeague.season}]
  while (currentLeague.previous_league_id) {
    currentLeague = await getLeague(currentLeague.previous_league_id)
    record.push({leagueId: currentLeague.league_id, season: currentLeague.season})
  }
  return record
}

async function getLeague(leagueId) {
  const leagueUrl = "https://api.sleeper.app/v1/league/" + leagueId;
  return (await axios.get(leagueUrl)).data;
}



countTrades()