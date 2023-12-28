import axios from 'axios'
import { leagueUrl } from "./league.js";

function Team(owner, rosterId, maxPf) {
  this.owner = owner;
  this.rosterId = rosterId;
  this.maxPf = maxPf;

  this.subtractFromMaxPf = function(pointsToSubtract) {
    this.maxPf -= pointsToSubtract;
  }
}

export default Team;

Team.prototype.revive = function(obj) {
  return new Team(obj.owner, obj.roster_id, obj.settings.ppts)
}


export async function getTeamsWithMaxPf(leagueId) {
  let users = await getUsersInLeague(leagueId);
  const rostersUrl = leagueUrl(leagueId) + "/rosters";

  return (await axios.get(rostersUrl)).data.map(team => {
    team.owner = users.filter(user => user.id === team.owner_id)[0].username
    return Team.prototype.revive(team);
  });
}

async function getUsersInLeague(leagueId) {
  const leagueUsersUrl = leagueUrl(leagueId) + "/users"
  let users = (await axios.get(leagueUsersUrl)).data;
  return users.map(user => {
    return {
      username: user.display_name,
      id: user.user_id
    }
  })
}
