// Add this in scripts/contextMenuServiceWorker.js

// Function to get + decode API key
const getKey = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['openai-key'], (result) => {
        if (result['openai-key']) {
          const decodedKey = atob(result['openai-key']);
          resolve(decodedKey);
        }
      });
    });
  };


  const sendMessage = (content) => {
    console.log(`sendMessage 1 ${content.text} ${content}` + content);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0].id;
  
      chrome.tabs.sendMessage(
        activeTab,
        { message: 'inject', content },
        (response) => {
          console.log(`sendMessage 2 `+ response);
          if (response.status === 'failed') {
            console.log(`sendMessage 3 `);
            console.log('injection failed.');
          }
        }
      );
    });
  };

const generate = async (prompt) => {
  // Get your API key from storage
  const key = await getKey();
  const url = 'https://api.openai.com/v1/completions';
	
  // Call completions endpoint
  const completionResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 1250,
      temperature: 0.7,
    }),
  });
	
  // Select the top choice and send back
  const completion = await completionResponse.json();
  return completion.choices.pop();
}

const generateCompletionAction = async (info) => {
    try {
      console.log(`generateCompletionAction 1`);
      sendMessage('generating...');

      const { selectionText } = info;
      const basePromptPrefix =   
      `
      Tell me the main innovative features in bullet form, contained in the input patent claims. Use as little bullet point as possible.

      input :
      `;
  
      const baseCompletion = await generate(
        `${basePromptPrefix}${selectionText}`
      );
  
      // Add your second prompt here
      const secondPrompt = 
      `
      Use 20 characters to write a very short title. Then write a summary question.
      Then combine the innovative features in a short paragraph explaining the innovation and why it is important. Be very precise. Start by explaining the sector and context.
      End the potential applications of this technology. Show proof of usage by product in the market. be honest.
    
      input : ${baseCompletion.text}
      `;
  
      // Call your second prompt
      const secondPromptCompletion = await generate(secondPrompt);
      console.log(`${secondPromptCompletion.text}`);

      // Send the output when we're all done
      console.log(`generateCompletionAction 2`);
      sendMessage(`${secondPromptCompletion.text}`);

    } catch (error) {
      console.log(error);

      // Add this here as well to see if we run into any errors!
      console.log(`generateCompletionAction 3`);
      sendMessage(error.toString());
    }
  };

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'context-run',
      title: 'Generate blog post',
      contexts: ['selection'],
    });
  });
  
  // Add listener
  chrome.contextMenus.onClicked.addListener(generateCompletionAction);