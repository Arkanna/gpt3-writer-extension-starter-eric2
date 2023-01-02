
// Declare new function

const insert = (content) => {
    // Find Calmly editor input section
    const elements = document.getElementsByClassName('droid');

    if (elements.length === 0) {
        return;
    }

    const element = elements[0];
      
    // Grab the first p tag so we can replace it with our injection
    const pToRemove = element.childNodes[0];
    pToRemove.remove();
      
    // Split content by \n
    const splitContent = content.split('\n');
      
    // Wrap in p tags
    splitContent.forEach((content) => {
        const p = document.createElement('p');
    
        if (content === '') {
        const br = document.createElement('br');
        p.appendChild(br);
        } else {
        p.textContent = content;
        }
    
        // Insert into HTML one at a time
        element.appendChild(p);
    });
      
    // On success return true
    return true;
};



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(`addListener 1 ` + request.message);
    if (request.message === 'inject') {
      console.log(`addListener 2 `);
      const { content } = request;

      insert(content);
      
      console.log(`addListener 2 `);
      console.log(content);
  
      sendResponse({ status: 'success' });
    }
  });