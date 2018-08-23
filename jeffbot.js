var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, { colorize: true });
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {
	var args = message.split(' ');
	var isBotCmd = (args[0] == 'jeffbot' || args[0] == 'jeff');
    if (isBotCmd) {
        var cmd = getCommand(args);
        
        if(isResponseCommand(cmd)){
			logger.info('Command: ' + cmd);
			
			var target = getResponseTarget(args, user);
			logger.info('Target: ' + target);
			
			var cmdResponseString = getCommandResponse(cmd, target);
			bot.sendMessage({
                    to: channelID,
                    message: cmdResponseString
                });
			
		} else {
		bot.sendMessage({
                    to: channelID,
                    message: "I don't understand " + cmd
                });
		}
     }
});

/*
Returns true if the command is known to Jeff
*/
function isResponseCommand(command){
	switch(command){
		case "bigdickenergy":
		case "bigtiddyenergy":
		case "valid":
		case "nerfed":
		case "buffed":
		case "fuck":
		case "vegan":
			return true;
		default:
			return false;
	}
}

/*
Gets the command from the message based on formatting
*/
function getCommand(msgArgs){
	//If there are 3 args, the command should be the second one
	if(msgArgs.length == 3){
		return msgArgs[1];
	//If the message is in the format: how x is target? then x is the command
	} else if(isMessageInHowPhraseIsFormat(msgArgs)){
		return msgArgs[2];
	} else if(isMessageInDoesTargetFormat(msgArgs)){
		return msgArgs[3];
	}
	
	return '';
}

/*
Gets the target for the response based on the message formatting
*/
function getResponseTarget(msgArgs, user){
	if(msgArgs.length == 3 || isMessageInDoesTargetFormat(msgArgs)){
		return isTargetSender(msgArgs[2]) ? user : formatTarget(msgArgs[2]);
	} else if(isMessageInHowPhraseIsFormat(msgArgs)){
		return isTargetSender(msgArgs[4]) ? user : formatTarget(msgArgs[4]);
	}
	
	return '';
}

/*
Returns true if the message is in the format: "jeff how x is y" or "jeff how x are you" or "jeff how x am i"
*/
function isMessageInHowPhraseIsFormat(msgArgs){
	return msgArgs.length == 5 && msgArgs[1] == 'how' && (msgArgs[3] == 'is' || msgArgs[3] == 'am' || msgArgs[3] == 'are');
}

function isMessageInDoesTargetFormat(msgArgs){
	return msgArgs.length == 4 && (msgArgs[1] == 'does' || msgArgs[1] == 'do');
}

/*
Returns the target with any question marks removed and the first letter capitalized IE hanzo? to Hanzo
*/
function formatTarget(target){
	var capitalizedTarget = target.charAt(0).toUpperCase() + target.substr(1);
	if(capitalizedTarget.substr(capitalizedTarget.length - 1) == '?'){
		return capitalizedTarget.substring(0, capitalizedTarget.length - 1);
	}
	
	return capitalizedTarget;
}

/*
Gets the appropriate response to a command that should be sent to the server
*/
function getCommandResponse(command, target){
switch(command){
		case "bigdickenergy":
			return getHasPercentPhraseFormat(target, 'Big Dick Energy', 100);
		case "bigtiddyenergy":
			return getHasPercentPhraseFormat(target, 'Big Tiddy Energy', 100);
		case "valid":
			return getIsPercentPhraseFormat(target, 'valid', 69);
		case "nerfed":
			return getIsPercentPhraseFormat(target, 'nerfed', 0);
		case "buffed":
			return getIsPercentPhraseFormat(target, 'buffed', 9000);
		case "vegan":
			return getIsPercentPhraseFormat(target, 'vegan', 100);
		case "fuck":
			return getDoesTargetPhraseFormat(target, 'fuck', 'Only your waifu');
		default:
			return '';
	}
}

/*
Returns a random integer between the min and the max
*/
function getRandomNumber(min, max){
	return Math.floor(Math.random()*(max-min+1)+min);
}

/*
Returns a response string in the format: I have/Target has X% Phrase
If the target is 'You', the random int will be overridden with the 'jeffInt' value
*/
function getHasPercentPhraseFormat(target, phrase, jeffInt){
	var percent = isTargetJeff(target) ? jeffInt : getRandomNumber(1,100);
	var targetString = isTargetJeff(target) ? 'I have ' : target + ' has ';
	return targetString + percent + '% ' + phrase;
}

/*
Returns a response string in the format: I am/Target is X% Phrase
If the target is 'You', the random int will be overridden with the 'jeffInt' value
*/
function getIsPercentPhraseFormat(target, phrase, jeffInt){
	var percent = isTargetJeff(target) ? jeffInt : getRandomNumber(1,100);
	var targetString = isTargetJeff(target) ? 'I am ' : target + ' is ';
	return targetString + percent + '% ' + phrase;
}

/*
Returns a response string that is either Target does phrase or Target does not phrase
If the target is 'You', the response will be whatever jeffOverrideString is set to
*/
function getDoesTargetPhraseFormat(target, phrase, jeffOverrideString){
	if(isTargetJeff(target)){
		return jeffOverrideString;
	}
	
	if(getRandomNumber(0,1) == 1){
		return target + ' does ' + phrase;
	}
	
	return target + ' does not ' + phrase;
}

function isTargetJeff(target){
	return target == 'you' || target == 'You';
}

function isTargetSender(target){
    return target == 'me' || target == 'i' || target == 'Me' || target == 'I';
}