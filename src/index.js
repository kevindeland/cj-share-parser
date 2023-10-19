
// use Node.js to import a Zoom chat file and convert it to a JSON file
// re-arrange the messages to be displayed as comments


// import the file system module
const fs = require('fs');

const ChatParser = require('./services/ChatParser');


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

// print the messages array to the console
// load 2023-08-09.txt file and print the contents to the console

const filename = `chats/${FILE_DB[fileIndex].filename}`;
fs.readFile(filename, 'utf8', (err, data) => {

  let messages = ChatParser.parseFileDataIntoMessages(data);
  
  let afterTS = ChatParser.filterMessagesAfterTimestamp(messages, FILE_DB[fileIndex].sharetime);

  afterTS = afterTS.map(message => {
    let firstLine = message[0];
    let firstLineParts = ChatParser.parseFirstLineIntoParts(firstLine);
    
    message[0] = firstLineParts;
    return message;
  });

  let messageTypes = ChatParser.filterMessageTypes(afterTS);

  /**
   * Process the reaction messages into a more useful format.
   */
  messageTypes.reactMessages = messageTypes.reactMessages.map(message => {
    let reactMessage = ChatParser.parseReactMessage(message);
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
