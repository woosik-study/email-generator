function createCalendarEvent(e) {
  try {
   
    const params = e.parameters;

    const title = params.title;
    const startStr = params.start;
    const endStr = params.end;


    if (!title || !startStr || !endStr) {
      throw new Error("Missing event parameters (title, start, or end).");
    }

   
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error(`Invalid date format. Start: ${startStr}, End: ${endStr}`);
    }

 
    if (start >= end) {
      throw new Error("Start time must be before end time.");
    }

  
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