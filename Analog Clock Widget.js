// Dynamic Clock Widget for Scriptable
// Creates an abstract, visually interesting time display
// with colors and shapes that change on each refresh

// Create widget
let widget = new ListWidget();

// Configuration
const config = {
  refreshInterval: 0, // minutes
  useGradient: true,
  showSeconds: true,
  useCircularDesign: true
};

// Color palettes - each with 5 colors (hour, minute, second, background, text)
const colorPalettes = [
  ["#FF5252", "#FF7B25", "#FFC107", "#000B18", "#FFFFFF"], // Sunset
  ["#4CC9F0", "#4361EE", "#3A0CA3", "#10002B", "#FFFFFF"], // Ocean
  ["#06D6A0", "#1B9AAA", "#EF476F", "#073B4C", "#FFFFFF"], // Neon
  ["#8338EC", "#3A86FF", "#FF006E", "#0D1B2A", "#FFFFFF"]  // Galaxy
];

// Get current date and time
let now = new Date();
let hour = now.getHours();
let minute = now.getMinutes();
let second = now.getSeconds();
let milliseconds = now.getMilliseconds();

// Convert to 12-hour format
const hour12 = hour % 12 || 12;

// Calculate angles for clock hands (in degrees)
const hourAngle = (hour12 * 30) + (minute * 0.5); // 30 degrees per hour + adjustment
const minuteAngle = minute * 6; // 6 degrees per minute
const secondAngle = second * 6; // 6 degrees per second

// Select color palette based on time
const paletteIndex = Math.floor((hour % 24) / 6); // Changes every 6 hours
const colors = colorPalettes[paletteIndex];

// Set widget background
if (config.useGradient) {
  let gradient = new LinearGradient();
  gradient.colors = [new Color(colors[3]), new Color(colors[3], 0.8)];
  gradient.locations = [0.0, 1.0];
  widget.backgroundGradient = gradient;
} else {
  widget.backgroundColor = new Color(colors[3]);
}

// Set padding
widget.setPadding(16, 16, 16, 16);

// Function to create a drawing context
function createDrawContext(width, height) {
  const drawContext = new DrawContext();
  drawContext.size = new Size(width, height);
  drawContext.opaque = false;
  return drawContext;
}

// Calculate widget dimensions
// These will vary based on the widget size (small, medium, large)
const widgetWidth = 300; // Default width
const widgetHeight = 300; // Default height

// Create a drawing context for our clock
const ctx = createDrawContext(widgetWidth, widgetHeight);
ctx.respectScreenScale = true;

// Calculate clock center and radius
const centerX = widgetWidth / 2;
const centerY = widgetHeight / 2;
const radius = Math.min(centerX, centerY) - 30;

// Draw clock face background
if (config.useCircularDesign) {
  // Draw a subtle circular face
  ctx.setFillColor(new Color(colors[3], 0.5));
  ctx.fillEllipse(new Rect(centerX - radius, centerY - radius, radius * 2, radius * 2));
  
  // Draw hour markers
  ctx.setFillColor(new Color(colors[4], 0.6));
  for (let i = 0; i < 12; i++) {
    const angle = i * 30 * Math.PI / 180;
    const markerRadius = radius - 12;
    const x = centerX + Math.sin(angle) * markerRadius;
    const y = centerY - Math.cos(angle) * markerRadius;
    const size = i % 3 === 0 ? 6 : 3; // Larger markers for 12, 3, 6, 9
    ctx.fillEllipse(new Rect(x - size/2, y - size/2, size, size));
  }
}

// Function to draw clock hand
function drawHand(angle, length, width, color) {
  const angleRad = angle * Math.PI / 180;
  const handX = centerX + Math.sin(angleRad) * length;
  const handY = centerY - Math.cos(angleRad) * length;
  
  // Corrected line drawing function
  ctx.setStrokeColor(new Color(color));
  ctx.setLineWidth(width);
  const path = new Path();
  path.move(new Point(centerX, centerY));
  path.addLine(new Point(handX, handY));
  ctx.addPath(path);
  ctx.strokePath();
  
  // Draw circle at the end of hand for style
  ctx.setFillColor(new Color(color));
  ctx.fillEllipse(new Rect(handX - width, handY - width, width * 2, width * 2));
}

// Draw hour hand
drawHand(hourAngle, radius * 0.5, 6, colors[0]);

// Draw minute hand
drawHand(minuteAngle, radius * 0.75, 4, colors[1]);

// Draw second hand if enabled
if (config.showSeconds) {
  drawHand(secondAngle, radius * 0.9, 2, colors[2]);

  // Add a smaller rotating element at the tip of the second hand
  // to create more visual interest
  const secAngleRad = secondAngle * Math.PI / 180;
  const secX = centerX + Math.sin(secAngleRad) * (radius * 0.9);
  const secY = centerY - Math.cos(secAngleRad) * (radius * 0.9);
  
  // Draw a small design element that changes with milliseconds
  const pulseSize = 5 + Math.sin(milliseconds / 500 * Math.PI) * 3;
  ctx.setFillColor(new Color(colors[2], 0.6));
  ctx.fillEllipse(new Rect(secX - pulseSize, secY - pulseSize, pulseSize * 2, pulseSize * 2));
}

// Draw center point
ctx.setFillColor(new Color(colors[4]));
ctx.fillEllipse(new Rect(centerX - 5, centerY - 5, 10, 10));

// Draw decorative elements that change with time
const decorationCount = (second % 5) + 3; // Changes every 5 seconds
for (let i = 0; i < decorationCount; i++) {
  // Calculate position around the clock
  const decorAngle = (i * (360 / decorationCount) + second * 2) * Math.PI / 180;
  const decorDistance = radius * 1.1;
  const decorX = centerX + Math.sin(decorAngle) * decorDistance;
  const decorY = centerY - Math.cos(decorAngle) * decorDistance;
  
  // Draw decorative element
  const decorSize = 5 + (i % 3) * 2;
  ctx.setFillColor(new Color(colors[i % colors.length], 0.7));
  
  // Alternate between shapes for visual interest
  if (i % 2 === 0) {
    ctx.fillEllipse(new Rect(decorX - decorSize/2, decorY - decorSize/2, decorSize, decorSize));
  } else {
    ctx.fillRect(new Rect(decorX - decorSize/2, decorY - decorSize/2, decorSize, decorSize));
  }
}

// Add the drawing to the widget
widget.addImage(ctx.getImage());

// Add time as text
const timeFormat = new DateFormatter();
timeFormat.useShortTimeStyle();
const timeString = timeFormat.string(now);

const timeText = widget.addText(timeString);
timeText.font = Font.semiboldSystemFont(16);
timeText.textColor = new Color(colors[4]);
timeText.centerAlignText();

// Add date
widget.addSpacer(4);
const dateFormat = new DateFormatter();
dateFormat.useMediumDateStyle();
const dateString = dateFormat.string(now);

const dateText = widget.addText(dateString);
dateText.font = Font.systemFont(12);
dateText.textColor = new Color(colors[4], 0.8);
dateText.centerAlignText();

// Set refresh interval
widget.refreshAfterDate = new Date(Date.now() + (config.refreshInterval * 60 * 1000));

// Set widget
if (config.runsInApp) {
  widget.presentMedium();
}

Script.setWidget(widget);
Script.complete();
