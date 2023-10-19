
function parseLogFile(logFileContent) {

  // split into array of lines
  let messages = logFileContent.split('\n');
  // remove empty lines
  messages = messages.filter((message) => {
    return message.trim().length > 0;
  });

  // split into Sender and Message
  messages = messages.map((message) => {
    return {
      sender: message.split(':')[0].trim(),
      message: message.split(':')[1].trim(),
    };
  }); 

  console.log(messages);
  return messages;
}

describe('parseLogFile', () => {
  it('parses a log file into an array of messages', () => {
    // Sample input log file content
    const logFileContent = `
      User1: Hello, everyone!
      User2: Hi User1!
      User1: How's everyone doing?
    `;

    // Expected array of messages
    const expectedMessages = [
      { sender: 'User1', message: 'Hello, everyone!' },
      { sender: 'User2', message: 'Hi User1!' },
      { sender: 'User1', message: 'How\'s everyone doing?' },
    ];

    // Call the function to be tested
    const parsedMessages = parseLogFile(logFileContent);

    // Assert that the parsed messages match the expected result
    expect(parsedMessages).toEqual(expectedMessages);
  });
});