const PROJECT_ID = "email-generator-477702";
const VERTEX_AI_LOCATION = "us-central1";
const MODEL_ID = "gemini-2.5-flash";

function buildAddOn(e) {
  console.log("buildAddOn called");
  console.log("e object:", JSON.stringify(e));
  
  try {
    // Reply mode: if messageID exists in messageMetadata
    if (e && e.messageMetadata && e.messageMetadata.messageId) {
      console.log("Reply mode detected");
      return buildReplyCard(e);
    } else {
      // Compose mode: messageId does not exist
      console.log("Compose mode detected");
      return buildComposeCard();
    }
  } catch (error) {
    console.error("Error in buildAddOn:", error);
    throw error;
  }
}

function buildComposeCard() {
  console.log("buildComposeCard called");
  
  const section = CardService.newCardSection()
    .addWidget(
      CardService.newTextInput()
        .setFieldName("recipient")
        .setTitle("To (Recipient)")
        .setHint("e.g., john@example.com")
    )
    .addWidget(
      CardService.newTextParagraph().setText(
        "<b>What do you want to say:</b>"
      )
    )
    .addWidget(
      CardService.newTextInput()
        .setFieldName("userInput")
        .setTitle("Email Content")
        .setMultiline(true)
        .setHint("e.g., Ask about project deadline, Thank them for meeting...")
    )
    .addWidget(
      CardService.newButtonSet().addButton(
        CardService.newTextButton()
          .setText("Generate Draft")
          .setOnClickAction(
            CardService.newAction()
              .setFunctionName("generateCompose")
          )
      )
    );

  const card = CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader().setTitle("✉️ Email Draft Generator")
    )
    .addSection(section)
    .build();
  
  console.log("Card built successfully");
  return [card];
}

function buildReplyCard(e) {
  const messageId = e.messageMetadata.messageId;
  const message = GmailApp.getMessageById(messageId);

  const subject = message.getSubject();
  const from = message.getFrom();
  const body = message.getPlainBody();
  
  const preview = body.slice(0, 150);

  const section = CardService.newCardSection()
    .addWidget(CardService.newKeyValue().setTopLabel("From").setContent(from))
    .addWidget(CardService.newKeyValue().setTopLabel("Subject").setContent(subject))
    .addWidget(
      CardService.newTextParagraph().setText(`<b>Preview:</b><br>${preview}...`)
    )
    .addWidget(
      CardService.newTextParagraph().setText(
        "<i>Click the button below to generate an AI reply.</i>"
      )
    )
    .addWidget(
      CardService.newButtonSet().addButton(
        CardService.newTextButton()
          .setText("Generate AI Reply")
          .setOnClickAction(
            CardService.newAction()
              .setFunctionName("generateReply")
              .setParameters({messageId: messageId})
          )
      )
    );

  const card = CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader().setTitle("📧 Email Reply Generator")
    )
    .addSection(section)
    .build();

  return [card];
}

function generateCompose(e) {
  try {
    const recipient = e.formInput.recipient || "";
    const subject = e.formInput.subject || "";
    const userInput = e.formInput.userInput;
    
    if (!userInput || userInput.trim() === "") {
      throw new Error("Please enter some content first.");
    }
    
    // AIdraft
    const aiDraft = processComposeEmail(userInput, recipient, subject);
    
    // newcard section
    const section = CardService.newCardSection();
    
    if (recipient) {
      section.addWidget(
        CardService.newKeyValue().setTopLabel("To").setContent(recipient)
      );
    }
    
    if (subject) {
      section.addWidget(
        CardService.newKeyValue().setTopLabel("Subject").setContent(subject)
      );
    }
    
    section
      .addWidget(
        CardService.newTextParagraph().setText(`<b>AI Generated Draft:</b>`)
      )
      .addWidget(
        CardService.newTextParagraph().setText(aiDraft)
      )
      .addWidget(
        CardService.newButtonSet()
          .addButton(
            CardService.newTextButton()
              .setText("🔄 Regenerate")
              .setOnClickAction(
                CardService.newAction()
                  .setFunctionName("regenerateCompose")
                  .setParameters({
                    userInput: userInput,
                    recipient: recipient,
                    subject: subject
                  })
              )
          )
          .addButton(
            CardService.newTextButton()
              .setText("◀ Back")
              .setOnClickAction(
                CardService.newAction()
                  .setFunctionName("goBackToCompose")
              )
          )
      );
    
    const card = CardService.newCardBuilder()
      .setHeader(
        CardService.newCardHeader().setTitle("✨ Draft Generated")
      )
      .addSection(section)
      .build();
    
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().updateCard(card))
      .build();
      
  } catch (error) {
    console.error("Error generating compose:", error);
    
    const errorCard = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader().setTitle("❌ Error"))
      .addSection(
        CardService.newCardSection().addWidget(
          CardService.newTextParagraph().setText(`Error: ${error.message}`)
        )
      )
      .build();
    
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().updateCard(errorCard))
      .build();
  }
}

function regenerateCompose(e) {
  try {
    const userInput = e.parameters.userInput;
    const recipient = e.parameters.recipient || "";
    const subject = e.parameters.subject || "";
    
    const aiDraft = processComposeEmail(userInput, recipient, subject);
    
    const section = CardService.newCardSection();
    
    if (recipient) {
      section.addWidget(
        CardService.newKeyValue().setTopLabel("To").setContent(recipient)
      );
    }
    
    if (subject) {
      section.addWidget(
        CardService.newKeyValue().setTopLabel("Subject").setContent(subject)
      );
    }
    
    section
      .addWidget(
        CardService.newTextParagraph().setText(`<b>AI Generated Draft:</b>`)
      )
      .addWidget(
        CardService.newTextParagraph().setText(aiDraft)
      )
      .addWidget(
        CardService.newButtonSet()
          .addButton(
            CardService.newTextButton()
              .setText("🔄 Regenerate")
              .setOnClickAction(
                CardService.newAction()
                  .setFunctionName("regenerateCompose")
                  .setParameters({
                    userInput: userInput,
                    recipient: recipient,
                    subject: subject
                  })
              )
          )
          .addButton(
            CardService.newTextButton()
              .setText("◀ Back")
              .setOnClickAction(
                CardService.newAction()
                  .setFunctionName("goBackToCompose")
              )
          )
      );
    
    const card = CardService.newCardBuilder()
      .setHeader(
        CardService.newCardHeader().setTitle("✨ Draft Regenerated")
      )
      .addSection(section)
      .build();
    
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().updateCard(card))
      .build();
      
  } catch (error) {
    console.error("Error regenerating:", error);
    
    const errorCard = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader().setTitle("❌ Error"))
      .addSection(
        CardService.newCardSection().addWidget(
          CardService.newTextParagraph().setText(`Error: ${error.message}`)
        )
      )
      .build();
    
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().updateCard(errorCard))
      .build();
  }
}

function goBackToCompose(e) {
  const cards = buildComposeCard();
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(cards[0]))
    .build();
}

function generateReply(e) {
  try {
    const messageId = e.parameters.messageId;
    
    const message = GmailApp.getMessageById(messageId);
    const subject = message.getSubject();
    const from = message.getFrom();
    const body = message.getPlainBody();
    
    const maxBodyLength = 3000;
    const trimmedBody = body.length > maxBodyLength 
      ? body.slice(0, maxBodyLength) + "\n\n[... truncated for length ...]"
      : body;
    
    const emailContext = `From: ${from}\nSubject: ${subject}\n\n${trimmedBody}`;
    const aiReply = processEmail(emailContext);
    
    const section = CardService.newCardSection()
      .addWidget(
        CardService.newTextParagraph().setText(`<b>AI Generated Reply:</b>`)
      )
      .addWidget(
        CardService.newTextParagraph().setText(aiReply)
      )
      .addWidget(
        CardService.newButtonSet()
          .addButton(
            CardService.newTextButton()
              .setText("🔄 Regenerate")
              .setOnClickAction(
                CardService.newAction()
                  .setFunctionName("generateReply")
                  .setParameters({messageId: messageId})
              )
          )
      );
    
    const card = CardService.newCardBuilder()
      .setHeader(
        CardService.newCardHeader().setTitle("✨ AI Reply Generated")
      )
      .addSection(section)
      .build();
    
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().updateCard(card))
      .build();
      
  } catch (error) {
    console.error("Error generating reply:", error);
    
    const errorCard = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader().setTitle("❌ Error"))
      .addSection(
        CardService.newCardSection().addWidget(
          CardService.newTextParagraph().setText(`Error: ${error.message}`)
        )
      )
      .build();
    
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().updateCard(errorCard))
      .build();
  }
}

/**
 * Sends the Email to the Vertex AI and generates a reply
 * 
 * @param {string} emailText - The text of the email to reply.
 * @returns {string} - The draft of the reply of the given email
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
  console.log("Response:", body);

  if (statusCode !== 200) {
    console.error("Vertex AI error:", statusCode, body);
    throw new Error(`Vertex AI API call failed: ${statusCode} - ${body}`);
  }

  const parsed = JSON.parse(body);
  
  console.log("Parsed response:", JSON.stringify(parsed));
  
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
  console.log("Response:", body);

  if (statusCode !== 200) {
    console.error("Vertex AI error:", statusCode, body);
    throw new Error(`Vertex AI API call failed: ${statusCode} - ${body}`);
  }

  const parsed = JSON.parse(body);
  
  console.log("Parsed response:", JSON.stringify(parsed));
  
  if (!parsed.candidates || parsed.candidates.length === 0) {
    throw new Error(`No candidates in response: ${body}`);
  }
  
  if (!parsed.candidates[0].content.parts || parsed.candidates[0].content.parts.length === 0) {
    throw new Error(`No content parts in response. Finish reason: ${parsed.candidates[0].finishReason}`);
  }
  
  const draftText = parsed.candidates[0].content.parts[0].text;
  
  return draftText.trim();
}