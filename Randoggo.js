// Define the API URL
let url = "https://dog.ceo/api/breeds/image/random";  // Get random dog image

// Fetch data from the API
let req = new Request(url);
let response = await req.loadJSON();  // Parse the JSON response

// Extract the image URL from the response
let dogImageUrl = response.message;

// Create a widget to display the dog image
let widget = new ListWidget();
widget.backgroundColor = new Color("#000000");  // Black background for contrast

// Function to load an image from a URL
async function loadImage(url) {
  let imgReq = new Request(url);
  return await imgReq.loadImage();
}

// Add the dog image to the widget
try {
  let img = await loadImage(dogImageUrl);

  // Resize and crop the image to ensure the top part is visible
  let imageWidth = 300;
  let imageHeight = 300;
  let imgCanvas = new DrawContext();
  imgCanvas.size = new Size(imageWidth, imageHeight);
  imgCanvas.drawImageInRect(img, new Rect(0, 0, imageWidth, imageHeight));

  // Create the image element from the canvas
  let imageElement = widget.addImage(imgCanvas.getImage());
  imageElement.imageSize = new Size(imageWidth, imageHeight);  // Resize the image for the widget
  imageElement.centerAlignImage();  // Center the image within the widget
} catch (error) {
  console.log("Failed to load image:", error);
  widget.addText("Error loading image");
}

// Display the widget
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();  // Preview the widget
}

Script.complete();
