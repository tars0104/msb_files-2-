require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the server!');
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

// Route to get recommendations (POST method)
app.post('/get-recommendations', async (req, res) => {
  const { university, studentLoan, country, federalGrantsInterest, major, passiveIncomeInterest } = req.body;

  if (!university || !studentLoan || !country || !major || !passiveIncomeInterest) {
    return res.status(400).json({ error: 'Missing required fields' });
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

    if (response.choices[0].message && response.choices[0].message.content) {
      res.json({ recommendations: response.choices[0].message.content.trim() });
    } else {
      res.status(500).json({ error: 'No content found in the response' });
    }
  } catch (error) {
    console.error('Error:', error);  // Log the entire error object
    res.status(500).json({ error: 'Failed to get recommendations', details: error.message });
  }
});

// Route to submit feedback (POST method)
app.post('/submit-feedback', (req, res) => {
  const { feedbackHelpful, comments } = req.body;
  console.log('Feedback received:', feedbackHelpful, comments);
  res.json({ message: 'Feedback submitted successfully' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
