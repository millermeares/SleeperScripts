import axios from 'axios'

const millerUserId = "459457205712711680"

export async function getLatestBanInjuriesLeagueId() {
  const currentYear = new Date(Date.now()).getFullYear()
  let currentSeason = await getAllLeaguesForUserForSeason(millerUserId, currentYear)
  console.log(currentSeason)
  if (currentSeason.length == 0) {
    currentSeason = await getAllLeaguesForUserForSeason(millerUserId, currentYear-1)
  }
  console.log(currentSeason)
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