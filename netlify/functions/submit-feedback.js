exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
  
    const { feedbackHelpful, comments } = JSON.parse(event.body);
  
    console.log('Feedback received:', feedbackHelpful, comments); // Ideally, store this in a database
  
    return { statusCode: 200, body: JSON.stringify({ message: 'Feedback submitted successfully' }) };
  };
  