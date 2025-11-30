/**
 * Vertex AI API integration for email generation
 */

const PROJECT_ID = "email-generator-477702";
const VERTEX_AI_LOCATION = "us-central1";
const MODEL_ID = "gemini-2.5-flash";

/**
 * Sends the email to Vertex AI and generates a reply
 * 
 * @param {string} emailText - The text of the email to reply to
 * @returns {string} - The draft reply for the given email
 */
function processEmail(emailText) {
  const apiURL =
    `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${VERTEX_AI_LOCATION}/publishers/google/models/${MODEL_ID}:generateContent`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You must always answer in English. Generate a professional and concise draft reply to the following email:\n\n${emailText}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
    systemInstruction: {
      parts: [
        {
          text: "You are a helpful email assistant. Respond directly without extended thinking."
        }
      ]
    }
  };

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
    contentType: "application/json",
    muteHttpExceptions: true,
    payload: JSON.stringify(payload),
  };

  const startTime = new Date().getTime();
  const response = UrlFetchApp.fetch(apiURL, options);
  const endTime = new Date().getTime();
  
  console.log(`API call took ${endTime - startTime}ms`);

  const statusCode = response.getResponseCode();
  const body = response.getContentText();

  console.log("Status:", statusCode);

  if (statusCode !== 200) {
    console.error("Vertex AI error:", statusCode, body);
    throw new Error(`Vertex AI API call failed: ${statusCode} - ${body}`);
  }

  const parsed = JSON.parse(body);
  
  if (!parsed.candidates || parsed.candidates.length === 0) {
    throw new Error(`No candidates in response: ${body}`);
  }
  
  if (!parsed.candidates[0].content.parts || parsed.candidates[0].content.parts.length === 0) {
    throw new Error(`No content parts in response. Finish reason: ${parsed.candidates[0].finishReason}`);
  }
  
  const replyText = parsed.candidates[0].content.parts[0].text;
  
  return replyText.trim();
}

/**
 * Generates an email draft from user input
 * 
 * @param {string} userInput - What the user wants to convey
 * @param {string} recipient - Email recipient (optional)
 * @param {string} subject - Email subject (optional)
 * @returns {string} - The generated email draft
 */
function processComposeEmail(userInput, recipient, subject) {
  const apiURL =
    `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${VERTEX_AI_LOCATION}/publishers/google/models/${MODEL_ID}:generateContent`;

  let prompt = `You must always answer in English. Generate a professional and well-structured email based on the following request:\n\n${userInput}`;
  
  if (recipient) {
    prompt += `\n\nRecipient: ${recipient}`;
  }
  
  if (subject) {
    prompt += `\n\nSubject: ${subject}`;
  }

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
    systemInstruction: {
      parts: [
        {
          text: "You are a helpful email assistant. Respond directly without extended thinking."
        }
      ]
    }
  };

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
    contentType: "application/json",
    muteHttpExceptions: true,
    payload: JSON.stringify(payload),
  };

  const startTime = new Date().getTime();
  const response = UrlFetchApp.fetch(apiURL, options);
  const endTime = new Date().getTime();
  
  console.log(`Compose API call took ${endTime - startTime}ms`);

  const statusCode = response.getResponseCode();
  const body = response.getContentText();
  
  console.log("Status:", statusCode);

  if (statusCode !== 200) {
    console.error("Vertex AI error:", statusCode, body);
    throw new Error(`Vertex AI API call failed: ${statusCode} - ${body}`);
  }

  const parsed = JSON.parse(body);
  
  if (!parsed.candidates || parsed.candidates.length === 0) {
    throw new Error(`No candidates in response: ${body}`);
  }
  
  if (!parsed.candidates[0].content.parts || parsed.candidates[0].content.parts.length === 0) {
    throw new Error(`No content parts in response. Finish reason: ${parsed.candidates[0].finishReason}`);
  }
  
  const draftText = parsed.candidates[0].content.parts[0].text;
  
  return draftText.trim();
}

/**
 * Test function for processEmail
 */
function testProcess() {
  const sampleEmail = `
Hi,

I'm following up about our meeting next week. Are you still available on Thursday at 3 PM?

Best,
Alex
`;
  const reply = processEmail(sampleEmail);
  Logger.log(reply);
}

/**
 * Test function for processComposeEmail
 */
function testCompose() {
  const userInput = "Ask about project deadline";
  const recipient = "manager@company.com";
  const subject = "Project Deadline Inquiry";
  
  const draft = processComposeEmail(userInput, recipient, subject);
  Logger.log(draft);
}