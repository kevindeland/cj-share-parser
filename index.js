
// use Node.js to import a Zoom chat file and convert it to a JSON file
// re-arrange the messages to be displayed as comments


// import the file system module
const fs = require('fs');


/**
 * Reads in a file and parses it into an array of messages.
 * 
 * @param {String} filename file location
 * @param {Function} callback the function to be called with the messages array
 */
function parseFileIntoMessages(filename, callback) {
  // load the file and return an array of messages

    // load 2023-08-09.txt file and print the contents to the console
  fs.readFile(filename, 'utf8', (err, data) => {

    let messages = [];

    // for each line in data, print the line to the console
    data.split('\n').forEach((line) => {
      
      // if the line begins with a timestamp, print the line to the console
      if (line.match(/^\d{2}:\d{2}:\d{2}/)) {
        messages.push([line]);
      } else {
        // otherwise, add the line to the previous message
        messages[messages.length - 1].push(line);
      }
    });

    // print the messages array to the console
    callback(messages);
  });
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
  let messageBeginning = reactLineParts[1].slice(0, -3);
  let emoji = reactLineParts[2];
  // console.log(messageBeginning, emoji);

  return {
    timestamp: reactMessage[0].timestamp,
    sender: reactMessage[0].sender,
    messageBeginning: messageBeginning,
    emoji: emoji
  }
}

const FILE_DB = [
  {
    // √√√
    "sharetime": "09:25:00",
    "filename": "2023-07-31.txt"
  },
  {
    // FAILS
    "sharetime": "09:25:00",
    "filename": "2023-08-01.txt"
  },
  {
    // √√√
    "sharetime": "09:25:00",
    "filename": "2023-08-02.txt"
  },
  {
    "sharetime": "09:25:00",
    "filename": "2023-08-04.txt"
  },
  {
    // FAILS
    "sharetime": "09:25:00",
    "filename": "2023-08-07.txt"
  },
  {
    "sharetime": "09:25:00",
    "filename": "2023-08-08.txt"
  },
  {
    // BEST DEMO
    "sharetime": "09:25:00",
    "filename": "2023-08-09.txt"
  },
  {
    // FAILS
    "sharetime": "09:25:00",
    "filename": "2023-08-10.txt"
  },
]
let fileIndex = 6;

parseFileIntoMessages(`chats/${FILE_DB[fileIndex].filename}`, (messages) => {
  //console.log(messages);

  let afterTS = filterMessagesAfterTimestamp(messages, FILE_DB[fileIndex].sharetime);

  afterTS = afterTS.map(message => {
    let firstLine = message[0];
    let firstLineParts = parseFirstLineIntoParts(firstLine);
    
    message[0] = firstLineParts;
    return message;
  });

  let messageTypes = filterMessageTypes(afterTS);

  /**
   * Process the reaction messages into a more useful format.
   */
  messageTypes.reactMessages = messageTypes.reactMessages.map(message => {
    let reactMessage = parseReactMessage(message);
    return reactMessage;
  });

  //console.log(messageTypes.reactMessages);

  for (let shareMessage of messageTypes.shareMessages) {
    shareMessage.reacts = [];
  }

  /**
   * Map the reacts to the shares.
   */
  for (let reactMessage of messageTypes.reactMessages) {
    // find the share message that this react belongs to
    // this is found by checking the "messageBeginning" property of reactMessage and seeing if it matches the "message" property of shareMessage
    let shareMessage = messageTypes.shareMessages.find(shareMessage => {
      //console.log(shareMessage[1], reactMessage.messageBeginning);
      //console.log('********');
      //console.log(reactMessage.messageBeginning);
      // remove the tab from the beginning of the share message
      let slicedShare = shareMessage[1].slice(1);
      //console.log(slicedShare);
      let result = slicedShare.startsWith(reactMessage.messageBeginning);
      //console.log(result);
      return result;
    });
    //console.log(shareMessage);
    if (shareMessage ) shareMessage.reacts.push(reactMessage);
  }

  // console.log(messageTypes.shareMessages);

  /**
   * Display the share messages and their reactions in a more readable format
   */
  for (let shareMessage of messageTypes.shareMessages) {
    console.log('********')
    console.log(`${shareMessage[0].timestamp} ${shareMessage[0].sender}`);
    for (let i = 1; i < shareMessage.length; i++) {
      console.log(shareMessage[i]);
    }
    console.log('');
    for (let react of shareMessage.reacts) {
      console.log(`\t${react.sender} ${react.emoji}`);
    }
    console.log('********')
  }

});
