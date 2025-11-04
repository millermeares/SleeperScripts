import axios from 'axios'

const millerUserId = "459457205712711680"

export async function getLatestBanInjuriesLeagueId() {
  let seasonYear = new Date(Date.now()).getFullYear()
  let currentSeason = await getAllLeaguesForUserForSeason(millerUserId, seasonYear)
  if (currentSeason.length == 0) {
    seasonYear = seasonYear - 1
    currentSeason = await getAllLeaguesForUserForSeason(millerUserId, seasonYear)
  }
  console.log(`Using leagues from year ${seasonYear}.`)
  for(let i = 0; i < currentSeason.length; i++) {
    const league = currentSeason[i]
    if (league.name == "Ban Injuries") {
      return league.league_id
    }
  }
  throw new Error("stop")
}

async function getAllLeaguesForUserForSeason(userId, season) {
  const allLeaguesUrl = `https://api.sleeper.app/v1/user/${userId}/leagues/nfl/${season}`
  return (await axios.get(allLeaguesUrl)).data;
}

export function leagueUrl(leagueId) {
  return "https://api.sleeper.app/v1/league/" + leagueId;
}