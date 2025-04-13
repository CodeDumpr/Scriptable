// Creative Calendar Widget for Scriptable
// Shows current date, month, and year in a stylish design
// Can be used as a small, medium, or large widget

// Create widget
let widget = new ListWidget();

// Set background gradient
let gradient = new LinearGradient();
gradient.colors = [
  new Color("#1E90FF"), // Dodger Blue
  new Color("#4169E1")  // Royal Blue
];
gradient.locations = [0.0, 1.0];
widget.backgroundGradient = gradient;

// Get current date information
let now = new Date();
let weekday = now.toLocaleDateString('en-US', {weekday: 'long'});
let month = now.toLocaleDateString('en-US', {month: 'long'});
let day = now.getDate();
let year = now.getFullYear();

// Create a fancy-looking date display
widget.setPadding(16, 16, 16, 16);

// Day of week in small text at top
let dayOfWeekText = widget.addText(weekday.toUpperCase());
dayOfWeekText.font = Font.boldSystemFont(12);
dayOfWeekText.textColor = Color.white();
dayOfWeekText.textOpacity = 0.8;

widget.addSpacer(4);

// Day of month as large text
let dayText = widget.addText(day.toString());
dayText.font = Font.boldSystemFont(42);
dayText.textColor = Color.white();

widget.addSpacer(2);

// Month and year
let monthYearText = widget.addText(`${month} ${year}`);
monthYearText.font = Font.systemFont(16);
monthYearText.textColor = Color.white();
monthYearText.textOpacity = 0.9;

widget.addSpacer();

// Add next upcoming event if calendar access is granted
// Note: Requires user to grant calendar permission
try {
  let calendar = await Calendar.forEvents();
  let events = await CalendarEvent.today([calendar]);
  
  if (events.length > 0) {
    // Sort events by date
    events.sort((a, b) => a.startDate - b.startDate);
    
    // Find the next event that hasn't ended yet
    let nextEvent = events.find(event => event.endDate > now);
    
    if (nextEvent) {
      widget.addSpacer(8);
      
      let eventTimeText = widget.addText("NEXT EVENT");
      eventTimeText.font = Font.boldSystemFont(10);
      eventTimeText.textColor = Color.white();
      eventTimeText.textOpacity = 0.7;
      
      let eventTitleText = widget.addText(nextEvent.title);
      eventTitleText.font = Font.mediumSystemFont(14);
      eventTitleText.textColor = Color.white();
      
      // Format time
      let timeFormatter = new DateFormatter();
      timeFormatter.useShortTimeStyle();
      let eventTime = timeFormatter.string(nextEvent.startDate);
      let eventTimeDisplay = widget.addText(eventTime);
      eventTimeDisplay.font = Font.systemFont(12);
      eventTimeDisplay.textColor = Color.white();
      eventTimeDisplay.textOpacity = 0.8;
    }
  }
} catch (error) {
  // If we can't access the calendar or there's an error, just skip this part
  console.log("Could not load calendar events: " + error);
}

// Add a decorative element - small circles at bottom
widget.addSpacer();
let stack = widget.addStack();
stack.centerAlignContent();
stack.spacing = 6;

for (let i = 0; i < 5; i++) {
  let circle = stack.addText("●");
  circle.font = Font.mediumSystemFont(i === 2 ? 10 : 8);
  circle.textColor = Color.white();
  circle.textOpacity = i === 2 ? 0.9 : 0.5;
}

// Function to format time in a nice way with emoji
function getTimeEmoji() {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return "🌅 Morning";
  if (hour >= 12 && hour < 17) return "☀️ Afternoon";
  if (hour >= 17 && hour < 21) return "🌆 Evening";
  return "🌙 Night";
}

// Add time of day info with emoji
widget.addSpacer(4);
let timeOfDayText = widget.addText(getTimeEmoji());
timeOfDayText.font = Font.systemFont(12);
timeOfDayText.textColor = Color.white();
timeOfDayText.textOpacity = 0.8;

// Set widget refresh interval to 30 minutes
widget.refreshAfterDate = new Date(Date.now() + 30 * 60 * 1000);

// Complete the widget
Script.setWidget(widget);
Script.complete();

// For preview in app
widget.presentSmall();
