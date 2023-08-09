
// use Node.js to import a Zoom chat file and convert it to a JSON file
// re-arrange the messages to be displayed as comments


// import the file system module
const fs = require('fs');



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

// only allow messages that were sent after a certain time
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


parseFileIntoMessages('chats/2023-08-09.txt', (messages) => {
  //console.log(messages);

  let afterTS = filterMessagesAfterTimestamp(messages, '09:25:00');

  afterTS = afterTS.map(message => {
    let firstLine = message[0];
    let firstLineParts = parseFirstLineIntoParts(firstLine);
    
    message[0] = firstLineParts;
    return message;
  });

  let messageTypes = filterMessageTypes(afterTS);
  console.log(messageTypes);

});
