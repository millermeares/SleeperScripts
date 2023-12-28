import axios from 'axios'
import fs from 'fs';
import stringify from 'json-stringify-safe'
const playersUrl = "https://api.sleeper.app/v1/players/nfl"

const fileName = "playersFile.json"

async function fetchPlayers() {
  const playerResult = await axios.get(playersUrl).catch(e => {
    console.log("Error fetching players", e)
  })
  return playerResult
}

function moreThan1DayAgo(d) {
  const nowDate = Date.now()
  // difference in millseconds compared to seconds in a day * milliseconds.
  return nowDate - d > 84000 * 1000
}

function savePlayers(players) {
  let playersString = stringify(players)
  try {
    fs.writeFileSync(fileName, playersString)
  } catch (e) {
    console.log(e)
    console.log("error saving players")
  }
}

function shouldRefreshPlayers() {
  try {
    const mostRecentPlayers = JSON.parse(fs.readFileSync(fileName, "utf8"))
    const refreshedDate = Date.parse(mostRecentPlayers.headers.date)
    return moreThan1DayAgo(refreshedDate)
  } catch (e) {
    console.log("Error deciding if refresh should happen, indicating need to refresh", e)
    return true
  }
}

async function refreshPlayerFile() {
  const players = await fetchPlayers()
  savePlayers(players)
}

async function getPlayers() {
  if (shouldRefreshPlayers()) {
    await refreshPlayerFile()
  } else {
    console.log("Not refreshing players")
  }
  return JSON.parse(fs.readFileSync(fileName, "utf8")).data;
}


export default {savePlayers, getPlayers}