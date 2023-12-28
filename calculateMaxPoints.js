import axios from 'axios';
import playerProvider from './playerProvider.js';
import Players from './Players.js';
import Team from './Team.js';

const leagueId = "784442047112327168"; //todo: going to need to change league ID.
// todo: going to need to dynamically pull playersUrl based on what year this is running for.
const leagueUrl = "https://api.sleeper.app/v1/league/" + leagueId;
const matchUpUrl = leagueUrl + "/matchups/";
const leagueUsersUrl = leagueUrl + "/users";
const rostersUrl = leagueUrl + "/rosters";
const playersUrl = "https://api.sleeper.app/v1/players/nfl";

const WEEK_AMOUNT = 17;

export async function removeKickerAndDefense() {
  let players = new Players(playerProvider.getPlayers());
  let teams = await getTeamsWithMaxPf();
  for (let week = 1; week <= WEEK_AMOUNT; week++) {
    let weekMatchups = await getMatchUp(week);
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
  for (let i = 0; i < rosterInWeek.players.length; i++) {
    // need to figure out how many points a player scored in a week... that's not easy is it.
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
    console.log("Did not find any players of position " + position + " on team " + team.owner + " for week " + week)
    return;
  }
  console.log(maxPlayer.player.last_name + " had most points at position " + position + " with " +
    maxPlayer.points + " points for team " + team.owner + " in week " + week)
  team.subtractFromMaxPf(maxPlayer.points)
}

function getPlayerPointsInWeek(player, rosterInWeek) {
  return rosterInWeek.players_points[player.player_id]
}

async function getTeamsWithMaxPf() {
  let users = await getUsersInLeague();
  return (await axios.get(rostersUrl)).data.map(team => {
    team.owner = users.filter(user => user.id === team.owner_id)[0].username
    return Team.prototype.revive(team);
  });
}

async function getUsersInLeague() {
  let users = (await axios.get(leagueUsersUrl)).data;
  return users.map(user => {
    return {
      username: user.display_name,
      id: user.user_id
    }
  })
}

async function getMatchUp(week) {
  return (await axios.get(getMatchUpUrl(week))).data;
}

function getMatchUpUrl(week) {
  return matchUpUrl + week;
}

removeKickerAndDefense()