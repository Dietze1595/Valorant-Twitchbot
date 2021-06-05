const tmi = require("tmi.js");
var axios = require('axios');
const fs = require("fs"); 

const config = JSON.parse(fs.readFileSync("cfg.json"));


let client = new tmi.Client({
    identity: {
		username: config.username,
		password: config.password
    },
	channels: config.channel,
    options: {
        debug: false
    },
    connection: {
        reconnect: true,
        secure: true
    }
});

client.connect();

client.on("connected", (address, port) => {
});


const talkedRecently = new Set();



client.on("chat", (channel, userstate, commandMessage, self) => {

		if (talkedRecently.has(commandMessage)) {
				client.action(channel, `Command in cooldown`); 
		}else {
			talkedRecently.add(commandMessage);
			setTimeout(() => {
			  // Removes the user from the set after a minute
			  talkedRecently.delete(commandMessage);
			}, config.cooldown);
			
			switch(commandMessage.split(" ")[0]){
			case '!feedback':
				client.action(channel, `If you have any suggestions or bug reports - please send me a Steammessage: http://steamcommunity.com/id/Dietze_`);
				break;
			case '!rank':
			case '!leaderboard':
				getRank(channel);
				break;
			case '!stats':
				getStats(channel);
				break;
			case '!last':
				getlast(channel);
				break;
			case '!cmd':
			case '!command':
			case '!commands':
				client.action(channel, `Commands: !rank !stats !last !update`);
				break;
			case '!update':
				getUpdate(channel);
				break;	
			default:
			}
		
		}
});


async function getStats(chan) {
  await axios
    .get(
      'https://api.tracker.gg/api/v2/valorant/standard/matches/riot/'+config.ValorantName+'%23'+config.Tagline+'?type=competitive',
    )
    .then(response => {
      if (response.status !== 200) 
	  {
		var isNull = true;
      } else 
	  { 
		var matches = response.data.data;
		for (var i = 0; i < 20; i++) {
         	stats = matches.matches[i].segments[0].stats;
         	kills = parseInt(stats.kills.value) + kills;
    		HS = parseInt(stats.headshotsPercentage.value) + HS;
			KD = parseInt(stats.kdRatio.value) + KD;
    		DAMAGE = parseInt(stats.damagePerRound.value) + DAMAGE;
		}
		avgKills = Math.round(kills / 20);
		avgHs = Math.round(HS / 20);
		avgKD = (KD / 20).toFixed(2);
		avgDAMAGE = (DAMAGE / 20).toFixed(2);

        client.action(chan, `Here are the stats of the last 20 matches: Avg. Kills: ${avgKills} - Avg. HS%: ${avgHs}% - Avg. K/D: ${avgKD} - Avg. Damage/Round: ${avgDAMAGE}`);
      }
	  client.action(chan, `Damage/Round: ${damage} | K/D Ratio: ${kd} | Kills/Map: ${kills}`);
	})
    .catch(function(error) {});
}


async function getlast(chan) {
    await axios.get(
		'https://api.tracker.gg/api/v2/valorant/standard/matches/riot/'+config.ValorantName+'%23'+config.Tagline+'?type=competitive', {
	})
	.then(response => {
		if (response.status !== 200) {
			isNull = true;
		} else {
			last = response.data.data.matches[0];
			var won = (last.metadata.result == 'victory') ? "gewonnen" : "verloren";
			client.action(chan, `${config.ValorantName} hat die letzte Map ${last.metadata.mapName} mit ${last.segments[0].stats.roundsWon.value} : ${last.segments[0].stats.roundsLost.value} ${won}.`);
		}
	})
	.catch(function (error) {});
}

async function getRank(chan) {
    await axios.get(
		'https://dgxfkpkb4zk5c.cloudfront.net/leaderboards/affinity/EU/queue/competitive/act/52e9749a-429b-7060-99fe-4595426a0cf7?startIndex=499&size=1', {
	})
	.then(response => {
		if (response.status !== 200) {
			isNull = true;
		} else {
			var fuenf = response.data.players[0].rankedRating;
			getRanked(chan, fuenf);
			}
	})
	.catch(function (error) {});
}

async function getRanked(chan, fuenf) {
    await axios.get(
		'https://api.tracker.gg/api/v2/valorant/standard/profile/riot/'+config.ValorantName+'%23'+config.Tagline+'/stats/overview/competitiveTier?', {
	})
	.then(response => {
		if (response.status !== 200) {
			isNull = true;
		} else {
			var test = response.data.data.history.data;
			var rank = test[test.length-1];
			var rankname = rank[1].value[0];
			var RR = rank[1].value[1];
			var platz = rank[1].value[2];
			var needed = fuenf - RR;
			
			if(needed<=0){
				client.action(chan, `Rank: ${rankname} | Platz: ${platz} | RR aktuell: ${RR}`);
			} else {				
				client.action(chan, `Rank: ${rankname} | Platz: ${platz} | RR aktuell: ${RR} | RR bis Radiant: ${needed}`);
			}
		}
	})
	.catch(function (error) {});
}

async function getUpdate(chan) {
    await axios.get(
		'https://api.henrikdev.xyz/valorant/v1/website/en-us?filter=game_updates', {
	})
	.then(response => {
		if (response.status !== 200) {
			isNull = true;
		} else {
			var update = response.data.data[0];
console.log(response.data);
			client.action(chan, `${update.title} ${update.url}`);
		}
	})
	.catch(function (error) {});
}
