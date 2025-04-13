// Create a widget
let widget = new ListWidget();
widget.backgroundColor = new Color("#2E2E2E");  // Dark background for contrast

// Battery Monitor
let battery = Device.batteryLevel();
let batteryPercentage = Math.round(battery * 100);
let batteryCharging = Device.isCharging();

// Storage Monitor - Simulate available storage for example
let totalStorage = 128; // Set total storage in GB (adjust this based on your device)
let freeStorage = 64;   // Assume 64GB is free (for demo purposes)
let usedStorage = totalStorage - freeStorage;
let storagePercentage = Math.round((usedStorage / totalStorage) * 100);

// Battery Text
let batteryText = `Battery: ${batteryPercentage}%`;
if (batteryCharging) {
  batteryText += " (Charging)";
}

// Storage Text
let storageText = `Storage: ${usedStorage} GB / ${totalStorage} GB (${storagePercentage}%)`;

// Add Battery Status
let batteryElement = widget.addText(batteryText);
batteryElement.font = Font.boldSystemFont(16);
batteryElement.textColor = new Color("#FFFFFF");
batteryElement.centerAlignText();

// Add Storage Status
let storageElement = widget.addText(storageText);
storageElement.font = Font.systemFont(14);
storageElement.textColor = new Color("#FFFFFF");
storageElement.centerAlignText();

// Progress Bar for Storage Usage
let storageBar = widget.addStack();
storageBar.size = new Size(200, 10);  // Set the size of the progress bar
storageBar.addSpacer();
let storageFill = storageBar.addImage(await createStorageProgressBar(storagePercentage));
storageFill.imageSize = new Size(200 * (storagePercentage / 100), 10);  // Fill the bar according to usage

// Function to create the progress bar image
async function createStorageProgressBar(percentage) {
  let img = new DrawContext();
  img.size = new Size(200, 10);  // Width and height of the bar
  img.setFillColor(new Color("#00FF00"));
  img.fillRect(new Rect(0, 0, 200 * (percentage / 100), 10));
  return img.getImage();
}

// Display the widget
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();  // Preview the widget
}

Script.complete();
