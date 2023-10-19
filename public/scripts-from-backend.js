



/**
 * Reads in a file and parses it into an array of messages.
 * 
 * @param {String} filename file location
 * @param {Function} callback the function to be called with the messages array
 */
function parseFileDataIntoMessages(fileData) {
  // load the file and return an array of messages

  let messages = [];

  // for each line in data, print the line to the console
  fileData.split('\n').forEach((line) => {
    
    // if the line begins with a timestamp, print the line to the console
    if (line.match(/^\d{2}:\d{2}:\d{2}/)) {
      messages.push([line]);
    } else {
      // otherwise, add the line to the previous message
      messages[messages.length - 1].push(line);
    }
  });

  return messages;
}


/**
 * 
 * @param {*} firstLine 
 * @returns 
 */
function parseFirstLineIntoParts(firstLine) {

  // a regex that looks like this:
  // ${Timestamp} From ${SenderF SenderL} To ${Recipient}:
  // 09:25:00 From John Doe to Everyone:
  let firstLineRegex = /^(\d{2}:\d{2}:\d{2}) From (([a-zA-Z]+ )+)to Everyone:/;

  // console.log(firstLine);
  // use the regex to parse the first line
  let firstLineParts = firstLine.match(firstLineRegex);
  // console.log(firstLineParts);

  // return an object with the parts
  return {
    timestamp: firstLineParts[1],
    // remove trailing whitespace
    sender: firstLineParts[2].trim(),
  };
}


/**
 * In Collective Journaling, each participant can share a part of their personal journal with the group.
 * This happens at the end of the meeting, after breakout groups. It is usually around 9:25am.
 * The purpose of this function is to filter out messages that were sent before 9:25am, so only the shares are left.
 * 
 * @param {Array} messages array of messages
 * @param {String} timestamp a timestamp string in the format 'hh:mm:ss'
 * @returns 
 */
function filterMessagesAfterTimestamp(messages, timestamp)  {

  let filterTimestampInSeconds = (timestamp.split(':')[0] * 60 * 60) + (timestamp.split(':')[1] * 60) + timestamp.split(':')[2];
  //console.log(`filterTimestampInSeconds: ${filterTimestampInSeconds}`);

  // filter messages by timestamp
  return messages.filter((message) => {
    // return true if the message was sent after the timestamp
    // first item in the message array begins with the timestamp
    // use a regex to get the timestamp
    let timestampRegex = /^\d{2}:\d{2}:\d{2}/;
    let timestamp = message[0].match(timestampRegex);
    //console.log(timestamp);

    // hours, minutes, seconds
    let timestampHours = timestamp[0].split(':')[0];
    let timestampMinutes = timestamp[0].split(':')[1];
    let timestampSeconds = timestamp[0].split(':')[2];

    // convert timestamp to seconds
    let timestampInSeconds = (timestampHours * 60 * 60) + (timestampMinutes * 60) + timestampSeconds;
    //console.log(`timestampInSeconds: ${timestampInSeconds}`);

    let result = timestampInSeconds > filterTimestampInSeconds;
    //console.log(result);
    // return true if the message was sent after the timestamp
    return timestampInSeconds > filterTimestampInSeconds;
  });
}



/**
 * The way Zoom chat messages are formatted, there are three types of messages:
 * 1. Top-Level comments. In our nomenclature we will call them "Shares"
 * 2. Replies to top-level comments. "Replies".
 * 3. Emoji Reactions to any comment (both Shares and Replies). "Reacts".
 * 
 * This function filters the messages into these three types.
 * 
 * @param {Array} messages array of messages
 * 
 * @returns Messages are filtered into three types: Share, Reacts, Replies
 */
function filterMessageTypes(messages) {

  // three messages types: Share, Reacts, Replies
  // Share: message[1] default
  // React: message[1] begins with '\tReacted to'
  // Reply: message[1] begins with '\tReplying to'

  // filter messages by type
  let shareMessages = messages.filter((message) => {
    return message[1].match(/^\tReacted to/) === null && message[1].match(/^\tReplying to/) === null;
  });

  let reactMessages = messages.filter((message) => {
    return message[1].match(/^\tReacted to/) !== null;
  });

  let replyMessages = messages.filter((message) => {
    return message[1].match(/^\tReplying to/) !== null;
  });

  return {
    shareMessages: shareMessages,
    reactMessages: reactMessages,
    replyMessages: replyMessages
  };
}



function parseReactMessage(reactMessage) {
  //console.log(reactMessage);

  // great. fuck. we need a case where the Original Share goes into two lines
  // Example:
  // 	I am not awake, 
	// But I am so alive.

  let reactLine = reactMessage[1];

  // a regex that looks like this:
  // \tReacted to "${MessageBeginning}..." with ${Emoji}
  // \tReacted to "I'm doing well. I'm..." with 👍
  let reactLineRegex = /^\tReacted to "([^"]+)" with ([^"]+)/;
  let reactLineParts = reactLine.match(reactLineRegex);
  //console.log(reactLineParts);
  // remove the last three dots from the message beginning
  let messageBeginning, emoji;
  try {

    messageBeginning = reactLineParts[1].slice(0, -3);
    emoji = reactLineParts[2];
    // console.log(messageBeginning, emoji);
  } catch {
    messageBeginning = null;
    emoji = null;
  }

  return {
    timestamp: reactMessage[0].timestamp,
    sender: reactMessage[0].sender,
    messageBeginning: messageBeginning,
    emoji: emoji
  }
}


function parseReplyMessage(replyMessage) {

  let replyLine = replyMessage[1];

  let replyLineRegex = /^\tReplying to "([^"]+)\.\.\."/;
  let replyLineParts = replyLine.match(replyLineRegex);

  let messageBeginning;
  try {
    messageBeginning = replyLineParts[1];
  } catch {
    messageBeginning = null;
  }

  return {
    timestamp: replyMessage[0].timestamp,
    sender: replyMessage[0].sender,
    messageBeginning: messageBeginning,
    message: replyMessage[3]
  }

}