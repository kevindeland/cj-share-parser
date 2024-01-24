// Get references to HTML elements
const dropZone = document.getElementById("drop-zone");
const chatContainer = document.getElementById("chat-container");

let DEBUG_LEVEL = 5;

// Prevent the default drag-and-drop behavior
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
});


// Handle file drop
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if (file && file.name.endsWith(".txt")) {
        const reader = new FileReader();

        reader.onload = function (e) {
            // Parse the chat log and display messages
            const chatLog = e.target.result;

            // -- TODO: dropdown goes here
            parseChatLog(chatLog, TIME);

            //displayParsedChatLog(sampleChatMessages);
        };

        reader.readAsText(file);
    }
});


function parseChatLog(chatLog) {
    // Split the chat log into individual chat messages

    if (DEBUG_LEVEL > 4) {
      console.log(chatLog);

      console.log('--- ⬇️ ---');

      console.log('--✨ parseFileDataIntoMessages ✨--');
    }

    const messages = parseFileDataIntoMessages(chatLog)

    if (DEBUG_LEVEL > 4) {

      console.log('--- ⬇️ ---');

      console.log(messages);

      console.log('--- ⬇️ ---');

      console.log('-- ✨ filterMessagesAfterTimestamp ✨ --');
    }

    const afterTS = filterMessagesAfterTimestamp(messages, TIME="08:25:00");

    if (DEBUG_LEVEL > 4) {

      console.log('--- ⬇️ ---');

      console.log(afterTS);

      console.log('--- ⬇️ ---');

      console.log('-- ✨ parseFirstLineIntoParts ✨ --');
    }

    const afterTSParsed = afterTS.map(message => {
      let firstLine = message[0];
      let firstLineParts = parseFirstLineIntoParts(firstLine);

      message[0] = firstLineParts;
      return message;
    })

    if (DEBUG_LEVEL > 4) {
        
        console.log('--- ⬇️ ---');
  
        console.log(afterTSParsed);
  
        console.log('--- ⬇️ ---');
  
        console.log('-- ✨ sortByMessageTypes ✨ --');
    }

    let messageTypes = sortByMessageTypes(afterTSParsed);

    /** This section is a whole clusterfuck of something */
    messageTypes.reactMessages = messageTypes.reactMessages.map(message => {
      let reactMessage = parseReactMessage(message);
      return reactMessage;
    })

    for (let shareMessage of messageTypes.shareMessages) {
      shareMessage.reacts = [];
    }

    /**
     * Map the reacts to the shares.
     */
    for (let reactMessage of messageTypes.reactMessages) {
      // find the share message that this react belongs to
      // this is found by checking the "messageBeginning" property of reactMessage
      // and seeing if it matches the "message" property of shareMessage
      let shareMessage = messageTypes.shareMessages.find(shareMessage => {
        // remove the tab at the beginning of the share message
        let slicedShare = shareMessage[1].slice(1);
        let result = slicedShare.startsWith(reactMessage.messageBeginning);

        return result;
      })

      if (shareMessage) {
        console.log(reactMessage);
        shareMessage.reacts.push(reactMessage);
      }

    }

    messageTypes.replyMessages = messageTypes.replyMessages.map(message => {
      let replyMessage = parseReplyMessage(message);
      return replyMessage;
    });

    for (let shareMessage of messageTypes.shareMessages) {
      shareMessage.replies = [];
    }

    /**
     * Map the replies to the shares.
     */
    for (let replyMessage of messageTypes.replyMessages) {

      console.log('====' + replyMessage.messageBeginning + '====');
      let shareMessage = messageTypes.shareMessages.find(shareMessage => {
        // remove the tab at the beginning of the share message
        let slicedShare = shareMessage[1].slice(1);

        let result = slicedShare.startsWith(replyMessage.messageBeginning);


        return result;
      })

      if (shareMessage) {
        console.log('√√√');
        console.log(shareMessage);
        shareMessage.replies.push(replyMessage);
      }
    }

    console.log(messageTypes);

    console.log(messageTypes.shareMessages);

    // Display each chat message as a chat box
    messageTypes.shareMessages.forEach((message) => {
      // Create a chat box element
      const chatBox = document.createElement("div");
      chatBox.classList.add("chat-box");

      // Create a sender name element and style it
      const senderName = document.createElement("div");
      senderName.classList.add("sender-name");
      senderName.textContent = message[0].sender;
      chatBox.appendChild(senderName)

      // Create a message element and style it
      const messageText = document.createElement("div");
      messageText.classList.add("message-text");
      messageText.textContent = message[1];
      // ugh there's gotta be a better way to do this
      for (let i = 2; i < message.length; i++) {
        messageText.textContent += "\n" + message[i];
      }
      chatBox.appendChild(messageText);

      // Create an emoji container element and style it
      const emojiContainer = document.createElement("div");
      emojiContainer.classList.add("emoji-container");

      // Iterate through emojis and create emoji elements
      message.reacts.forEach((react) => {
        const emoji = document.createElement("span");
        emoji.classList.add("emoji");
        emoji.textContent = react.emoji;
        console.log('EMOJI!!');
        console.log(JSON.stringify(react));
        console.log(react.sender);
        emoji.setAttribute("data-reaction-name", react.sender);
        emojiContainer.appendChild(emoji);
      });

      chatBox.appendChild(emojiContainer);

      // Create a reply container element and style it
      const replyContainer = document.createElement("div");
      replyContainer.classList.add("reply-container");

      // Iterate through replies and create reply elements
      message.replies.forEach((reply) => {
        const replyMessage = document.createElement("div");
        replyMessage.classList.add("reply-message");
        
        const replySender = document.createElement("span");
        replySender.classList.add("reply-sender");
        replySender.textContent = reply.sender;
        replyMessage.appendChild(replySender);

        const replyText = document.createElement("span");
        replyText.classList.add("reply-text");
        replyText.textContent = reply.message;
        replyMessage.appendChild(replyText);
        
        replyContainer.appendChild(replyMessage);
      });

      chatBox.appendChild(replyContainer);

      chatContainer.appendChild(chatBox);
    });
}


const sampleChatMessages = [
  {
      sender: "User1",
      message: "Hello, everyone!",
      replies: [
          { sender: "User2", message: "Hi User1!" }
      ],
      reacts: [
          { sender: "User3", emoji: "👍" },
          { sender: "User4", emoji: "❤️" }
      ]
  },
  {
    sender: "Peter",
    message: "Gm crowd",
    replies: [
        { sender: "Kevin", message: "yo!" }
    ],
    reacts: [
        { sender: "User3", emoji: "🙂" },
        { sender: "User4", emoji: "🔥" }
    ]
},
  // More chat messages...
];


function displayParsedChatLog(chatMessages) {
  chatMessages.forEach((message) => {
      const chatBox = document.createElement("div");
      chatBox.classList.add("chat-box");

      // Content Message
      const contentMessage = document.createElement("div");
      contentMessage.classList.add("content-message");
      contentMessage.textContent = `${message.sender}: ${message.message}`;
      chatBox.appendChild(contentMessage);

      // Replies
      if (message.replies && message.replies.length > 0) {
          const replyContainer = document.createElement("div");
          replyContainer.classList.add("reply-container");
          message.replies.forEach((reply) => {
              const replyMessage = document.createElement("div");
              replyMessage.classList.add("reply-message");
              replyMessage.textContent = `${reply.sender}: ${reply.message}`;
              replyContainer.appendChild(replyMessage);
          });
          chatBox.appendChild(replyContainer);
      }

      // Reacts
      if (message.reacts && message.reacts.length > 0) {
          const reactContainer = document.createElement("div");
          reactContainer.classList.add("react-container");
          message.reacts.forEach((react) => {
              const reactEmoji = document.createElement("span");
              reactEmoji.classList.add("react-emoji");
              reactEmoji.innerHTML = react.emoji;
              reactContainer.appendChild(reactEmoji);
          });
          chatBox.appendChild(reactContainer);
      }

      chatContainer.appendChild(chatBox);
  });
}
