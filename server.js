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

const mentors = [
    {
        name: "John Doe",
        expertise: "affiliateMarketing",
        discordcontact: "johnny"
    },
    {
        name: "Jane Smith",
        expertise: "contentCreation",
        discordcontact: "jansmit"
    },
    {
        name: "Michael Johnson",
        expertise: "stockInvesting",
        discordcontact: "michaelangelo"
    },
    {
        name: "Emily Davis",
        expertise: "realEstate",
        discordcontact: "emdave"
    },
    {
        name: "Sarah Wilson",
        expertise: "onlineCourses",
        discordcontact: "sarahswill"
    }
];

// Route to get recommendations (POST method)
app.post('/get-recommendations', async (req, res) => {
    console.log('POST /get-recommendations called');
    const { university, studentLoan, country, federalGrantsInterest, major, passiveIncomeInterest, incomeOptions } = req.body;

    console.log('Received data:', { university, studentLoan, country, federalGrantsInterest, major, passiveIncomeInterest, incomeOptions });

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
            content: `University: ${university}\nStudent Loan: $${studentLoan}\nCountry: ${country}\nInterested in Federal Grants: ${federalGrantsInterest ? 'Yes' : 'No'}\nMajor: ${major}\nPassive Income Interest: ${passiveIncomeInterest}\nIncome Options: ${incomeOptions.join(', ')}`
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
            // Find matching mentors based on selected income options
            const matchedMentors = mentors.filter(mentor => incomeOptions.includes(mentor.expertise));
            res.json({ recommendations: response.choices[0].message.content.trim(), mentors: matchedMentors });
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
    console.log(`Server running at http://localhost:${port}`);
});
