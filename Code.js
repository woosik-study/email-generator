// ============================================
// MAIN ENTRY POINT
// Determines whether to show compose or reply mode
// ============================================

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

// ============================================
// ACTION HANDLERS - COMPOSE MODE
// Functions for generating and managing email drafts
// ============================================

function generateCompose(e) {
  try {
    const recipient = e.formInput.recipient || "";
    const subject = e.formInput.subject || "";
    const userInput = e.formInput.userInput;
    
    if (!userInput || userInput.trim() === "") {
      throw new Error("Please enter some content first.");
    }
    
    // Generate AI draft (calls Vertex.gs function)
    const aiDraft = processComposeEmail(userInput, recipient, subject);
    
    // Build card with generated draft
    const card = buildGeneratedDraftCard(aiDraft, userInput, recipient, subject);
    
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().updateCard(card))
      .build();
      
  } catch (error) {
    console.error("Error generating compose:", error);
    return showErrorCard(error.message);
  }
}

function regenerateCompose(e) {
  try {
    const userInput = e.parameters.userInput;
    const recipient = e.parameters.recipient || "";
    const subject = e.parameters.subject || "";
    
    // Generate AI draft (calls Vertex.gs function)
    const aiDraft = processComposeEmail(userInput, recipient, subject);
    
    const card = buildGeneratedDraftCard(aiDraft, userInput, recipient, subject, true);
    
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().updateCard(card))
      .build();
      
  } catch (error) {
    console.error("Error regenerating:", error);
    return showErrorCard(error.message);
  }
}

function goBackToCompose(e) {
  const cards = buildComposeCard();
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(cards[0]))
    .build();
}

// ============================================
// ACTION HANDLERS - REPLY MODE
// Functions for generating AI replies to emails
// ============================================

function refreshLatestReply(e) {
  try {
    const messageId = e.parameters.messageId;
    const message = GmailApp.getMessageById(messageId);
    const thread = message.getThread();
    
    // Get the latest message in the thread
    const messages = thread.getMessages();
    const latestMessage = messages[messages.length - 1];
    const latestMessageId = latestMessage.getId();
    
    const subject = latestMessage.getSubject();
    const from = latestMessage.getFrom();
    const body = latestMessage.getPlainBody();
    const preview = body.slice(0, 150);

    // Build preview card for the latest message
    const section = CardService.newCardSection()
      .addWidget(CardService.newKeyValue().setTopLabel("From").setContent(from))
      .addWidget(CardService.newKeyValue().setTopLabel("Subject").setContent(subject))
      .addWidget(
        CardService.newTextParagraph().setText(`<b>Preview:</b><br>${preview}...`)
      )
      .addWidget(
        CardService.newTextParagraph().setText(
          "<i>Choose an action below.</i>"
        )
      )
      .addWidget(
        CardService.newButtonSet()
          .addButton(
            CardService.newTextButton()
              .setText("Generate AI Reply")
              .setOnClickAction(
                CardService.newAction()
                  .setFunctionName("generateReply")
                  .setParameters({messageId: latestMessageId})
              )
          )
          .addButton(
            CardService.newTextButton()
              .setText("Summarize Email")
              .setOnClickAction(
                CardService.newAction()
                  .setFunctionName("handleSummarizeEmail")
                  .setParameters({messageId: latestMessageId})
              )
          )
      )
      .addWidget(
        CardService.newButtonSet()
          .addButton(
            CardService.newTextButton()
              .setText("Refresh Latest")
              .setOnClickAction(
                CardService.newAction()
                  .setFunctionName("refreshLatestReply")
                  .setParameters({messageId: latestMessageId})
              )
          )
      );

    const card = CardService.newCardBuilder()
      .setHeader(
        CardService.newCardHeader()
          .setTitle("Email Reply Assistant")
      )
      .addSection(section)
      .build();
    
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().updateCard(card))
      .build();
      
  } catch (error) {
    console.error("Error refreshing latest preview:", error);
    return showErrorCard(error.message);
  }
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
    
    // Generate AI reply (calls Vertex.gs function)
    const aiReply = processEmail(emailContext);
    
    const card = buildGeneratedReplyCard(aiReply, messageId);
    
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().updateCard(card))
      .build();
      
  } catch (error) {
    console.error("Error generating reply:", error);
    return showErrorCard(error.message);
  }
}

// ============================================
// EMAIL SUMMARIZATION & CALENDAR FEATURES
// Functions for summarizing emails and creating calendar events
// ============================================

function handleSummarizeEmail(e) {
  const messageId = e.parameters.messageId;
  const message = GmailApp.getMessageById(messageId);
  const emailText = message.getPlainBody();

  try {
    const summary = summarizeEmail(emailText);
    const calendarEvent = extractCalendarEvents(emailText);

    const section = CardService.newCardSection().addWidget(
      CardService.newTextParagraph().setText(`<b>Summary:</b><br>${summary}`)
    );

    if (calendarEvent.hasCalendarEvent) {
      // Display event information
      section.addWidget(
        CardService.newTextParagraph().setText(
          `<br><b>📅 Event Detected:</b><br>` +
          `Title: ${calendarEvent.title || "N/A"}<br>` +
          `Start: ${new Date(calendarEvent.start).toLocaleString()}<br>` +
          `End: ${new Date(calendarEvent.end).toLocaleString()}`
        )
      );

      const action = CardService.newAction()
        .setFunctionName("createCalendarEvent")
        .setParameters({
          title: calendarEvent.title || "Untitled Event",
          start: calendarEvent.start,
          end: calendarEvent.end,
        });

      const addToCalendarButton = CardService.newTextButton()
        .setText("📅 Add Event to Calendar")
        .setOnClickAction(action)
        .setBackgroundColor("#34A853");

      section.addWidget(addToCalendarButton);
    }

    const card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader().setTitle("Email Summary"))
      .addSection(section)
      .addSection(
        CardService.newCardSection().addWidget(
          CardService.newTextButton()
            .setText("◀ Back")
            .setOnClickAction(
              CardService.newAction().setFunctionName("buildAddOn")
            )
        )
      )
      .build();

    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(card))
      .build();
  } catch (error) {
    console.error("Error in handleSummarizeEmail:", error);
    return showErrorCard(error.message);
  }
}

function createCalendarEvent(e) {
  try {
    // Correct parameters access
    const params = e.parameters;

    const title = params.title;
    const startStr = params.start;
    const endStr = params.end;

    // Validate parameters
    if (!title || !startStr || !endStr) {
      throw new Error("Missing event parameters (title, start, or end).");
    }

    // Parse dates
    const start = new Date(startStr);
    const end = new Date(endStr);

    // Verify valid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error(`Invalid date format. Start: ${startStr}, End: ${endStr}`);
    }

    // Check if start time is before end time
    if (start >= end) {
      throw new Error("Start time must be before end time.");
    }

    // Create calendar event
    const calendar = CalendarApp.getDefaultCalendar();
    const event = calendar.createEvent(title, start, end);

    console.log(`Calendar event created: ${event.getId()}`);

    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification()
          .setText(`✅ "${title}" added to Google Calendar!`)
      )
      .build();

  } catch (err) {
    console.error("Calendar event creation error:", err);
    
    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification()
          .setText(`❌ Failed to create event: ${err.message}`)
      )
      .build();
  }
}

// ============================================
// TEST FUNCTIONS
// ============================================

/**
 * Test function for createCalendarEvent
 */
function testCreateCalendarEvent() {
  const mockEvent = {
    parameters: {
      title: "Test Meeting",
      start: "2024-01-15T14:00:00-08:00",
      end: "2024-01-15T15:00:00-08:00"
    }
  };
  
  const result = createCalendarEvent(mockEvent);
  Logger.log(result);
}