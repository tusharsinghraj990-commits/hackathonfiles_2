const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');

menuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

// Dynamic placeholder animation
const searchInput = document.getElementById('searchInput');
const words = ["Radiation impact on body...", "Space microbes...", "Nutrient sources...", "Growth of plant..."];
let wordIndex = 0;

function changePlaceholder() {
  searchInput.setAttribute("placeholder", words[wordIndex]);
  wordIndex = (wordIndex + 1) % words.length;
}

setInterval(changePlaceholder, 2000);

// Format AI response to handle paragraphs, lists, and headings
function formatResponse(text) {
  if (!text || typeof text !== 'string') return '<p>No response content available.</p>';

  // Split by double newlines for paragraphs
  let paragraphs = text.split('\n\n').filter(p => p.trim());
  let html = '';

  paragraphs.forEach(paragraph => {
    // Handle headings (e.g., # Title, ## Title)
    if (paragraph.match(/^#{1,3}\s+/)) {
      const level = paragraph.match(/^#+/)[0].length;
      const title = paragraph.replace(/^#+\s+/, '');
      html += `<h${level + 2}>${title}</h${level + 2}>`;
    }
    // Handle lists (e.g., •, -, *, 1., 1), etc.)
    else if (paragraph.match(/^[\•\-\*\d+\.\)]\s+/m)) {
      let items = paragraph.split('\n').filter(item => item.trim());
      html += '<ul class="result-list">';
      items.forEach(item => {
        const cleanItem = item.replace(/^[\•\-\*\d+\.\)]\s+/, '');
        if (cleanItem) html += `<li>${cleanItem}</li>`;
      });
      html += '</ul>';
    }
    // Handle paragraphs
    else {
      html += `<p>${paragraph}</p>`;
    }
  });

  return html || '<p>No response content available.</p>';
}

document.addEventListener('DOMContentLoaded', function() {
  const searchButton = document.querySelector('.search-box button');
  const resultDiv = document.getElementById('result');

  searchButton.addEventListener('click', async function() {
    resultDiv.style.display="block";
    const query = searchInput.value.trim();
    if (!query) {
      resultDiv.innerHTML = '<p class="error">Please enter a search query.</p>';
      return;
    }

    resultDiv.innerHTML = '<p class="loading">Loading response...</p>';

    try {
      const response = await fetch('https://www.chatbase.co/api/v1/chat', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer a8bdb2ba-f864-48cc-a98c-1d574e29c6bb',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { content: 'Always respond in a structured format with bullet points and key points.', role: 'system' },
            { content: query, role: 'user' }
          ],
          chatbotId: 'GrGl8jM6h_ZFhedaLftqk',
          stream: false,
          temperature: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }

      const data = await response.json();
      resultDiv.innerHTML = `<h3>AI Response:</h3>${formatResponse(data.text)}`;
    } catch (error) {
      resultDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
  });
});