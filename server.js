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

// Route to get recommendations (POST method)
app.post('/get-recommendations', async (req, res) => {
  const { university, studentLoan, country, federalGrantsInterest, major, passiveIncomeInterest } = req.body;

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

// Route to submit feedback (POST method)
app.post('/submit-feedback', (req, res) => {
  const { rating, comments } = req.body;
  console.log('Feedback received:', rating, comments);
  res.json({ message: 'Feedback submitted successfully' });
});

app.listen(port, () => {
  console.log(`Server running at https://msb01-7a42ba9d8940.herokuapp.com:${port}`);
});
