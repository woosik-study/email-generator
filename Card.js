// ============================================
// CARD 1: COMPOSE MODE - Initial Input Card
// Displays form for creating a new email draft
// ============================================

function buildComposeCard() {
  console.log("buildComposeCard called");
  
  const section = CardService.newCardSection()
    .addWidget(
      CardService.newTextInput()
        .setFieldName("recipient")
        .setTitle("To (Recipient)")
        .setHint("e.g., john")
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
          .setText("✨ Generate Draft")
          .setOnClickAction(
            CardService.newAction()
              .setFunctionName("generateCompose")
          )
      )
    );

  const card = CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader().setTitle("Email Compose Draft")
    )
    .addSection(section)
    .build();
  
  console.log("Card built successfully");
  return [card];
}

// ============================================
// CARD 2: REPLY MODE - Email Preview Card
// Shows email preview and options to generate reply or summarize
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
                .setParameters({messageId: messageId})
            )
        )
        .addButton(
          CardService.newTextButton()
            .setText("Summarize Email")
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName("handleSummarizeEmail")
                .setParameters({messageId: messageId})
            )
        )
    )
    .addWidget(
      CardService.newButtonSet()
        .addButton(
          CardService.newTextButton()
            .setText("Return to Latest")
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName("refreshLatestReply")
                .setParameters({messageId: messageId})
            )
        )
    );

  const card = CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader()
        .setTitle("Email Reply Draft")
    )
    .addSection(section)
    .build();

  return [card];
}

// ============================================
// CARD 3: COMPOSE MODE - Generated Draft Display Card
// Shows the AI-generated email draft with options to regenerate or go back
// ============================================

function buildGeneratedDraftCard(aiDraft, userInput, recipient, subject, isRegenerated = false) {
  const section = CardService.newCardSection();
  
  if (recipient) {
    section.addWidget(
      CardService.newKeyValue().setTopLabel("To").setContent(recipient)
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
            .setText("Regenerate")
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
            .setText("Back")
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
// Shows the AI-generated reply with options to regenerate or go back
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
            .setText("Regenerate")
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName("generateReply")
                .setParameters({messageId: messageId})
            )
        )
        .addButton(
          CardService.newTextButton()
            .setText("Back")
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName("buildAddOn")
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
    .setHeader(
      CardService.newCardHeader()
        .setTitle("❌ Something went wrong")
        .setImageUrl(
          "https://www.gstatic.com/images/icons/material/system/1x/error_outline_black_48dp.png"
        )
        .setImageStyle(CardService.ImageStyle.CIRCLE)
    )
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextParagraph().setText(
            `<b>Error:</b><br>${errorMessage}`
          )
        )
        .addWidget(
          CardService.newTextParagraph().setText(
            "<i>Please try again or contact support if the issue persists.</i>"
          )
        )
        .addWidget(
          CardService.newButtonSet().addButton(
            CardService.newTextButton()
              .setText("◀ Back")
              .setOnClickAction(
                CardService.newAction().setFunctionName("buildAddOn")
              )
          )
        )
    )
    .build();
  
  return errorCard;
}

// ============================================
// HELPER: Show Error Card with Navigation
// ============================================

function showErrorCard(errorMessage) {
  const card = buildErrorCard(errorMessage);
  
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(card))
    .build();
}