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