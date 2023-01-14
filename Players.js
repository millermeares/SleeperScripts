function Players(players) {
  const _me = this;
  this.players = players;

  this.getPlayer = function(id) {
    return players[id]
  }
}

export default Players