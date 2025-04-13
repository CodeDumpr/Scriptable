// Configurable settings
const useCustomBackground = false // Set to true to use an image background
const customImageName = "calendar-bg.jpg" // File must be in iCloud/Scriptable

let widget = new ListWidget()

// Background logic
if (useCustomBackground) {
  let img = await loadImage(customImageName)
  widget.backgroundImage = img
} else {
  let bgColor = Color.dynamic(
    new Color("#f0f0f0"),
    new Color("#1c1c1e")
  )
  widget.backgroundColor = bgColor
}

// Get upcoming events (today and beyond)
let now = new Date()
let upcoming = await getUpcomingEvents(3)

if (upcoming.length === 0) {
  let freeText = widget.addText("No events this week!")
  freeText.font = Font.mediumSystemFont(16)
  freeText.textColor = Color.gray()
  freeText.centerAlignText()
} else {
  for (let event of upcoming) {
    const isToday = isSameDay(event.startDate, now)
    const weekdayLabel = !isToday ? ` (${formatDay(event.startDate)})` : ""

    let hStack = widget.addStack()
    hStack.layoutHorizontally()
    hStack.centerAlignContent()

    // Calendar dot
    let dot = hStack.addText("•")
    dot.textColor = event.calendar.color
    dot.font = Font.systemFont(18)

    // Event title
    let title = hStack.addText(` ${event.title}${weekdayLabel}`)
    title.font = Font.semiboldSystemFont(14)
    title.textColor = Color.dynamic(Color.black(), Color.white())
    title.lineLimit = 1

    // Event time + location
    let timeFormatter = new DateFormatter()
    timeFormatter.useNoDateStyle()
    timeFormatter.useShortTimeStyle()
    let timeStr = timeFormatter.string(event.startDate)

    let subtext = widget.addText(`Starts at ${timeStr}${event.location ? " • " + event.location : ""}`)
    subtext.font = Font.systemFont(12)
    subtext.textColor = Color.gray()

    widget.addSpacer(8)
  }

  // Tap Action: Open Calendar app or direct event link
  const firstEvent = upcoming[0]
  if (firstEvent) {
    let url = `calshow:${Math.floor(firstEvent.startDate.getTime() / 1000)}`
    widget.url = url
  }
}

// End
if (config.runsInWidget) {
  Script.setWidget(widget)
} else {
  widget.presentMedium()
}
Script.complete()

// Helpers

async function getUpcomingEvents(maxCount) {
  let allUpcoming = []
  let daysToCheck = 7
  let now = new Date()

  for (let i = 0; i < daysToCheck && allUpcoming.length < maxCount; i++) {
    let date = new Date()
    date.setDate(now.getDate() + i)

    let dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    let dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    let dayEvents = await CalendarEvent.between(dayStart, dayEnd)
    let futureEvents = dayEvents.filter(e => e.startDate > now)
    allUpcoming.push(...futureEvents)
  }

  return allUpcoming.slice(0, maxCount)
}

function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function formatDay(date) {
  const df = new DateFormatter()
  df.dateFormat = "EEE"
  return df.string(date)
}

async function loadImage(name) {
  let fm = FileManager.iCloud()
  let path = fm.joinPath(fm.documentsDirectory(), name)
  if (!fm.fileExists(path)) {
    throw new Error(`Image not found: ${name}`)
  }
  await fm.downloadFileFromiCloud(path)
  return fm.readImage(path)
}
