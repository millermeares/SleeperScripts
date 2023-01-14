import fs from 'fs';
import stringify from 'json-stringify-safe'

const fileName = "playersFile.json"
function savePlayers(players) {
  // commented out so it only happens once.
  // let playersString = stringify(players)
  // fs.writeFile(fileName, playersString, 'utf8', function(err) {
  //   if(err) {
  //     console.log(err)
  //     console.log("error saving players")
  //   }
  // });
}

function getPlayers() {
  return JSON.parse(fs.readFileSync(fileName, "utf8")).data;
}


export default {savePlayers, getPlayers}