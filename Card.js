// ============================================
// CARD 1: COMPOSE MODE - Initial Input Card
// ============================================

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
  
  // ============================================
  // CARD 2: REPLY MODE - Email Preview Card
  // ============================================
  
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
  
  // ============================================
  // CARD 3: COMPOSE MODE - Generated Draft Display Card
  // ============================================
  
  function buildGeneratedDraftCard(aiDraft, userInput, recipient, subject, isRegenerated = false) {
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
    
    const title = isRegenerated ? "✨ Draft Regenerated" : "✨ Draft Generated";
    
    const card = CardService.newCardBuilder()
      .setHeader(
        CardService.newCardHeader().setTitle(title)
      )
      .addSection(section)
      .build();
    
    return card;
  }
  
  // ============================================
  // CARD 4: REPLY MODE - Generated Reply Display Card
  // ============================================
  
  function buildGeneratedReplyCard(aiReply, messageId) {
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
    
    return card;
  }
  
  // ============================================
  // CARD 5: ERROR DISPLAY CARD
  // ============================================
  
  function buildErrorCard(errorMessage) {
    const errorCard = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader().setTitle("❌ Error"))
      .addSection(
        CardService.newCardSection().addWidget(
          CardService.newTextParagraph().setText(`Error: ${errorMessage}`)
        )
      )
      .build();
    
    return errorCard;
  }