
const dropZone = document.getElementById("drop-zone");

// Prevent the default drag-and-drop behavior
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();

  const file = e.dataTransfer.files[0];

  if (file && file.name.endsWith(".txt")) {
    const reader = new FileReader();

    reader.onload = function (e) {
      // Parse the chat log and display messages
      const chatLog = e.target.result;
      parseChatLog(chatLog);
    };

    reader.readAsText(file);
  }
});

// --- re-write the sortByMessageTypes code here:
function sortByMessageTypes(messages) {

  let shareMessages = messages.filter(message => {
    return message.message.match(/^\tReacted to/) === null && message.message.match(/^\tReplying to/) === null;
  });

  let reactMessages = messages.filter(message => {
    return message.message.match(/^\tReacted to/) !== null;
  })

  let replyMessages = messages.filter(message => {
    return message.message.match(/^\tReplying to/) !== null;
  });

  return {
    shareMessages, reactMessages, replyMessages
  }
}

function parseChatLog(chatLog) {

  const messages = parseFileDataIntoMessages(chatLog);

  const afterTS = filterMessagesAfterTimestamp(messages, "09:25:00");

  const afterTSParsed = afterTS.map(message => {
    let firstLine = message[0];
    let firstLineParts = parseFirstLineIntoParts(firstLine);

    // omg this is much better
    return {
      timestamp: firstLineParts.timestamp,
      sender: firstLineParts.sender,
      message: message.slice(1).join('\n'),
    };
  })

  const sorted = sortByMessageTypes(afterTSParsed); // sorted (by message type (share, react, reply) )

  const alchemizedReacts = sorted.reactMessages.map(parseReactMessage);
  //const alchemizedReacts = sorted.reactMessages;

  const pipeline = new TransformationPipeline(chatLog, messages, afterTS, afterTSParsed, sorted, alchemizedReacts);

  pipeline.drawToWindow();

}

class TransformationPipeline {
  constructor(initialData, messages, filtered, parsed, sorted, alchemizedReacts) {
    this.initialData = initialData; // text
    this.messages = messages;       // array of texts
    this.filtered = filtered;
    this.parsed = parsed;
    this.sorted = sorted;
    this.alchemizedReacts = alchemizedReacts;
  }

  drawToWindow() {
    // -- getting the HTML elements --
    const chatLogElement = document.getElementById("chatLog");
    const messageListElement = document.getElementById("messageList");
    const filteredList = document.getElementById("filteredList");
    const parsedList = document.getElementById("parsedList");


    // -- setting the content inside the HTML elements --
    // Display the chat log
    chatLogElement.textContent = this.initialData;

    // Display messages
    for (const message of this.messages) {
      const messageElement = document.createElement("div");
      messageElement.className = "message";
      messageElement.textContent = message.join(" - ");
      messageListElement.appendChild(messageElement);
    }

    // ----
    for (const message of this.filtered) {
      const messageElement = document.createElement("div");
      messageElement.className = "message";
      messageElement.textContent = message.join(" - ");
      filteredList.appendChild(messageElement);
    }

    // ----
    for (const triad of this.parsed) {
      const messageElement = document.createElement("div");
      messageElement.className = "message";

      const spanTimestamp = document.createElement("span");
      spanTimestamp.className = "timestamp";
      spanTimestamp.textContent = triad.timestamp;
      messageElement.appendChild(spanTimestamp);

      const spanSender = document.createElement("span");
      spanSender.className = "sender";
      spanSender.textContent = triad.sender;
      messageElement.appendChild(spanSender);

      const spanMessageContent = document.createElement("span");
      spanMessageContent.className = "message-content";
      spanMessageContent.textContent = triad.message;
      messageElement.appendChild(spanMessageContent);

      parsedList.appendChild(messageElement);
    }


    // ----
    // ---- 
    const sortedShares = document.getElementById("sortedShares");
    const sortedReacts = document.getElementById("sortedReacts");
    const sortedReplies = document.getElementById("sortedReplies");

    const sortedShares2 = document.getElementById("sortedShares2");
    const sortedReacts2 = document.getElementById("sortedReacts2");
    const sortedReplies2 = document.getElementById("sortedReplies2");

    // ----
    for (const share of this.sorted.shareMessages) {
      const messageElement = document.createElement("div");
      messageElement.className = "message";
      messageElement.textContent = `${share.timestamp} - ${share.sender} - ${share.message}`;
      sortedShares.appendChild(messageElement);

      // DUPLICATE CODE
      const messageElement2 = document.createElement("div");
      messageElement2.className = "message";
      messageElement2.textContent = `${share.timestamp} - ${share.sender} - ${share.message}`;
      sortedShares2.appendChild(messageElement2);
    }

    // ----
    for (const react of this.sorted.reactMessages) {
      const messageElement = document.createElement("div");
      messageElement.className = "message";
      //messageElement.textContent = JSON.stringify(react);
      messageElement.textContent = `${react.timestamp} - ${react.sender} - ${react.message}`;
      sortedReacts.appendChild(messageElement);

      // DUPLICATE CODE
      const messageElement2 = document.createElement("div");
      messageElement2.className = "message";
      messageElement2.textContent = `${react.timestamp} - ${react.sender} - ${react.message}`;
      sortedReacts2.appendChild(messageElement2);
    }

    // ----
    for (const reply of this.sorted.replyMessages) {
      const messageElement = document.createElement("div");
      messageElement.className = "message";
      messageElement.textContent = JSON.stringify(reply);
      //messageElement.textContent = `${reply.timestamp} - ${reply.sender} - ${reply.messageBeginning} - ${reply.emoji}`;
      sortedReplies.appendChild(messageElement);

      // DUPLICATE CODE
      const messageElement2 = document.createElement("div");
      messageElement2.className = "message";
      messageElement2.textContent = JSON.stringify(reply);
      //messageElement.textContent = `${reply.timestamp} - ${reply.sender} - ${reply.messageBeginning} - ${reply.emoji}`;
      sortedReplies2.appendChild(messageElement2);

    }

    const alchemizedReactsList = document.getElementById("alchemizedReactsList");
    // ----
    for (const aReact of this.alchemizedReacts) {
      const messageElement = document.createElement("div");
      messageElement.className = "message";

      const divTS = document.createElement("div");
      divTS.className = "timestamp";
      divTS.textContent = aReact.timestamp;
      messageElement.appendChild(divTS);

      const divSender = document.createElement("div");
      divSender.className = "sender";
      divSender.textContent = aReact.sender;
      messageElement.appendChild(divSender);

      const divMessageBeginning = document.createElement("div");
      divMessageBeginning.className = "message-beginning";
      divMessageBeginning.textContent = aReact.messageBeginning;
      messageElement.appendChild(divMessageBeginning);

      const divEmoji = document.createElement("div");
      divEmoji.className = "emoji";
      divEmoji.textContent = aReact.emoji;
      messageElement.appendChild(divEmoji);

      alchemizedReactsList.appendChild(messageElement);
    }
  }
}

// Example usage
const initialData = "Zoom chat log content goes here.";
const messages = [
  ["User 1", "Hello, how are you?"],
  ["User 2", "I'm good, thanks!"],
  // Add more messages as needed
];

/*
const pipeline = new TransformationPipeline(initialData, messages);
pipeline.drawToWindow();*/