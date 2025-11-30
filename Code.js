
// MAIN ENTRY POINT


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
  
  
  // ACTION HANDLERS - COMPOSE MODE
  
  
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
      
      const errorCard = buildErrorCard(error.message);
      
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
      
      // Generate AI draft (calls Vertex.gs function)
      const aiDraft = processComposeEmail(userInput, recipient, subject);
      
      const card = buildGeneratedDraftCard(aiDraft, userInput, recipient, subject, true);
      
      return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation().updateCard(card))
        .build();
        
    } catch (error) {
      console.error("Error regenerating:", error);
      
      const errorCard = buildErrorCard(error.message);
      
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
  
  
  // ACTION HANDLERS - REPLY MODE
  
  
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
      
      const errorCard = buildErrorCard(error.message);
      
      return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation().updateCard(errorCard))
        .build();
    }
  }