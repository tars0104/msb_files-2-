require('dotenv').config();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { university, studentLoan, country, federalGrantsInterest, major, passiveIncomeInterest } = JSON.parse(event.body);

  if (!university || !studentLoan || !country || !major || !passiveIncomeInterest) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  const messages = [{
    role: "system",
    content: "Provide personalized recommendations based on the following details:"
  }, {
    role: "user",
    content: `University: ${university}
              Student Loan: $${studentLoan}
              Country: ${country}
              Interested in Federal Grants: ${federalGrantsInterest ? 'Yes' : 'No'}
              Major: ${major} Passive Income Interest: ${passiveIncomeInterest}`
  }];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 500,
    });

    if (response.choices[0].message && response.choices[0].message.content) {
      return { statusCode: 200, body: JSON.stringify({ recommendations: response.choices[0].message.content.trim() }) };
    } else {
      return { statusCode: 500, body: JSON.stringify({ error: 'No content found in the response' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to get recommendations', details: error.message }) };
  }
};
