import axios from 'axios'
import playerProvider from "./playerProvider.js"
import Players from './Players.js';
import Team from './Players.js';
import { getTeamsWithMaxPf } from "./Team.js";
import { getLatestBanInjuriesLeagueId, leagueUrl } from './league.js';

const WEEK_AMOUNT = 15

const MIN_EXPECTED_SCORERS = {
  QB: 1,
  RB: 2,
  WR: 3,
  TE: 1
}


async function detectAnomalies() {
  const leagueId = await getLatestBanInjuriesLeagueId()
  const players = new Players(await playerProvider.getPlayers())
  const teams = await getTeamsWithMaxPf(leagueId);
  for (let week = 1; week <= WEEK_AMOUNT; week++) {
    await detectAnomalyInWeek(leagueId, players, teams, week)
  }
}

async function detectAnomalyInWeek(leagueId, players, teams, week) {
  let weekMatchups = await getMatchUp(leagueId, week);
  const requiredPositions = Object.keys(MIN_EXPECTED_SCORERS)
  for (let i = 0; i < weekMatchups.length; i++) {
    let rosterInWeek = weekMatchups[i]
    let team = teams.filter(team => team.rosterId === rosterInWeek.roster_id)[0];
    requiredPositions.forEach(position => {
      const scorerCount = countNonZeroScorersFromPosition(players, team, rosterInWeek, position)
      // i could actually detect *invalid* lineups if I could determine whether a player was active in a certain week.
      if (scorerCount < MIN_EXPECTED_SCORERS[position]) {
        const msg = `Only ${scorerCount} ${position} scored non-zero points on ${team.owner} team in week ${week}`
        console.log(`Anomaly: ${msg}`)
      }
    })
  }
}


function getPlayersOfPosition(players, rosterInWeek, position) {
  const positionPlayers = []
  for (let i = 0; i < rosterInWeek.players.length; i++) {
    let player = players.getPlayer(rosterInWeek.players[i])
    if(player.fantasy_positions.includes(position)) {
      positionPlayers.push(player)
    }  
  }
  return positionPlayers
}

function getPlayerPointsInWeek(player, rosterInWeek) {
  return rosterInWeek.players_points[player.player_id]
}

function countNonZeroScorersFromPosition(players, team, rosterInWeek, position) {
  let count = 0
  const positionPlayers = getPlayersOfPosition(players, rosterInWeek, position)
  for (let i = 0; i < positionPlayers.length; i++) {
    const playerPointsInWeek = getPlayerPointsInWeek(positionPlayers[i], rosterInWeek)
    if (playerPointsInWeek != 0) {
      count++
    }
  }
  return count
}

async function getMatchUp(leagueId, week) {
  return (await axios.get(getMatchUpUrl(leagueId, week))).data;
}

function getMatchUpUrl(leagueId, week) {
  return leagueUrl(leagueId) + "/matchups/" + week
}

detectAnomalies()

