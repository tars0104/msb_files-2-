require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});



// Test connection route
app.get('/test-connection', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/engines', {
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Connection test error:', error);
    res.status(500).json({ error: 'Connection test failed', details: error.message });
  }
});

// Route to get recommendations (GET method)
app.get('/get-recommendations', async (req, res) => {
  const { university, studentLoan, country, federalGrantsInterest, major, passiveIncomeInterest } = req.query;

  console.log('Received data:', { university, studentLoan, country, federalGrantsInterest, major, passiveIncomeInterest });

  if (!university || !studentLoan || !country || !major || !passiveIncomeInterest) {
    console.error('Missing required fields');
    return res.status(500).json({ error: 'Missing required fields' });
  }

  const messages = [
    {
      role: 'system',
      content: 'Provide personalized recommendations based on the following details:'
    },
    {
      role: 'user',
      content: `University: ${university}\nStudent Loan: $${studentLoan}\nCountry: ${country}\nInterested in Federal Grants: ${federalGrantsInterest ? 'Yes' : 'No'}\nMajor: ${major}\nPassive Income Interest: ${passiveIncomeInterest}`
    }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500
    });

    console.log('OpenAI response:', response);

    if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
      res.json({ recommendations: response.choices[0].message.content.trim() });
    } else {
      console.error('No content found in the response:', response);
      res.status(500).json({ error: 'No content found in the response' });
    }
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations', details: error.message });
  }
});

// Route to submit feedback (GET method for testing purposes)
app.get('/submit-feedback', (req, res) => {
  const { feedbackHelpful, comments } = req.query;
  console.log('Feedback received:', feedbackHelpful, comments);
  res.json({ message: 'Feedback submitted successfully' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
