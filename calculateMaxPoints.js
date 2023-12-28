import axios from 'axios';
import playerProvider from './playerProvider.js';
import Players from './Players.js';
import Team, { getTeamsWithMaxPf } from './Team.js';
import { getLatestBanInjuriesLeagueId, leagueUrl } from './league.js';
const WEEK_AMOUNT = 14; // don't count playoffs.

export async function removeKickerAndDefense() {
  const banInjuriesLeagueId = await getLatestBanInjuriesLeagueId()
  let players = new Players(await playerProvider.getPlayers());
  let teams = await getTeamsWithMaxPf(banInjuriesLeagueId);
  for (let week = 1; week <= WEEK_AMOUNT; week++) {
    let weekMatchups = await getMatchUp(banInjuriesLeagueId, week);
    removeMaxOfPositionFromScores(players, teams, weekMatchups, week, "DEF");
    removeMaxOfPositionFromScores(players, teams, weekMatchups, week, "K");
  }
  teams.sort((a, b) => a.maxPf - b.maxPf);
  console.log(teams);
}

function removeMaxOfPositionFromScores(players, teams, weekMatchups, week, position) {
  for (let i = 0; i < weekMatchups.length; i++) {
    let rosterInWeek = weekMatchups[i];
    let team = teams.filter(team => team.rosterId === rosterInWeek.roster_id)[0];
    removeMaxOfPositionFromScore(players, team, rosterInWeek, week, position);
  }
}

function removeMaxOfPositionFromScore(players, team, rosterInWeek, week, position) {
  let maxPlayer;
  // todo: would liek to eliminate byes from this calculation to avoid a bye overshadowing a negative player.
  // super edge case, so not a huge deal.
  for (let i = 0; i < rosterInWeek.players.length; i++) {
    let player = players.getPlayer(rosterInWeek.players[i])
    if(!player.fantasy_positions.includes(position)) {
      continue;
    }
    let playerPointsInWeek = getPlayerPointsInWeek(player, rosterInWeek);
    if(!maxPlayer || playerPointsInWeek > maxPlayer.points) {
      maxPlayer = {
        points: playerPointsInWeek,
        player: player
      }
    }
  }
  if (!maxPlayer) {
    console.log(`Did not find any ${position}s on team ${team.owner} for week ${week}`)
    return;
  }
  if (maxPlayer.points < 0) {
    console.log(`Not subtracting points for ${maxPlayer.player.last_name} due to them having` + 
      ` negative (${maxPlayer.points}) for team ${team.owner} in week ${week}`)
    return;
  }
  console.log(`${maxPlayer.player.last_name} had most points at ${position} with ${maxPlayer.points} points ` + 
    `for team ${team.owner} in week ${week}`)
  team.subtractFromMaxPf(maxPlayer.points)
}

function getPlayerPointsInWeek(player, rosterInWeek) {
  return rosterInWeek.players_points[player.player_id]
}



async function getMatchUp(leagueId, week) {
  return (await axios.get(getMatchUpUrl(leagueId, week))).data;
}

function getMatchUpUrl(leagueId, week) {
  return leagueUrl(leagueId) + "/matchups/" + week
}

removeKickerAndDefense()