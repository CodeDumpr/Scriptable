const debug = false;
let stop = false;

function getLocation() {
    return new Promise((resp, reje) => {
        Location.current().then(loc => {
            resp(loc)
        })
    })
}

async function main() {
    return new Promise(async (resp, rej) => {
        if (stop) resp("stop")
        const location = await getLocation()
        const elevationNum = Math.round(location.altitude * 3.2808)
        const elevation = elevationNum + " ft."

        resp(elevation)
    })
}

function createWidget(ele) {

    let widget = new ListWidget()

    widget.url = "https://whatismyelevation.com"
    
    const imageData = Data.fromBase64String("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")

    widget.addImage(Image.fromData(imageData))
    
    let titleText = widget.addText("Elevation:")


    let titleTextFont = new Font("ArialMT", 20)

    titleText.font = titleTextFont

    let eleText = widget.addText(ele)

    let eleTextFont = new Font("Arial-BoldMT", 30)

    eleText.font = eleTextFont

    widget.backgroundColor = new Color("#4f92e2")

    let refreshAfterDate = new Date()

refreshAfterDate.setSeconds(refreshAfterDate.getSeconds() + 30)

    widget.refreshAfterDate = refreshAfterDate
    let updateTime = new Date()
    let updateHour = updateTime.getHours() < 10 ? "0" + updateTime.getHours() : updateTime.getHours()
    let updateMinutes = updateTime.getMinutes() < 10 ? "0" + updateTime.getMinutes() : updateTime.getMinutes()
    let updateSeconds = updateTime.getSeconds() < 10 ? "0" + updateTime.getSeconds() : updateTime.getSeconds()
    let updateText = widget.addText("Updated " + updateHour + ":" + updateMinutes + ":" + updateSeconds)

    updateText.font = new Font("ArialMT", 10)
    return widget
}

if (!config.runsInWidget && !debug) {
    stop = true;
}

main().then(async ele => {
    if (ele === "stop") {
      return Safari.openInApp("https://whatismyelevation.com")
    }
    if (debug) {
      let widget = createWidget(ele)
      await widget.presentSmall()
      return Script.complete()
    }
    let widget = createWidget(ele)
    Script.setWidget(widget)
    Script.complete()
})
