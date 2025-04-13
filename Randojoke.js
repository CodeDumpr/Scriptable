// Define the API URL for a random joke
let url = "https://v2.jokeapi.dev/joke/Any?type=single";  // Random joke

// Fetch data from the API
let req = new Request(url);
let response = await req.loadJSON();  // Parse the JSON response

// Extract the joke
let joke = response.joke;

// Create a widget to display the joke
let widget = new ListWidget();
widget.backgroundColor = new Color("#2E2E2E");  // Dark background for contrast

// Add the joke text to the widget
let jokeText = widget.addText(`"${joke}"`);
jokeText.font = Font.regularSystemFont(16);
jokeText.textColor = new Color("#FFFFFF");
jokeText.centerAlignText();

// Display the widget
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();  // Preview the widget
}

Script.complete();
