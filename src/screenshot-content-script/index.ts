document.body.style.backgroundColor = 'orange'

// Add feedbackAnnotator
const feedbackAnnotator = document.createElement('div')

feedbackAnnotator.id = 'mhi-roar-feedback-annotator'

const rect = document.body.getBoundingClientRect()

feedbackAnnotator.style.width = rect.width + 'px'
feedbackAnnotator.style.height = rect.height + 'px'
feedbackAnnotator.style.zIndex = '2147483646'
feedbackAnnotator.style.position = 'absolute'
feedbackAnnotator.style.top = '0px'
feedbackAnnotator.style.left = '0px'

feedbackAnnotator.innerHTML = `
  <div style="position: relative; overflow: hidden; width: 100%; height: 100%;">
    <div style="background-repeat: no-repeat; position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;"></div>
    <div style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;">
      <canvas height="${rect.height}" style="background: none; margin: 0px; padding: 0px; display: block;" width="${rect.width}"></canvas>
    </div>
    <div style="position: absolute; left: 0px; top: 0px; width: 0px; height: 0px;"></div>
    <div style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;"></div>
    <div style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; cursor: crosshair;"></div>
    <div style="position: absolute; left: 0px; top: 0px; width: 0px; height: 0px;"></div>
    <div style="position: absolute; left: 0px; top: 0px; width: 0px; height: 0px;"></div>
  </div>
`

document.body.appendChild(feedbackAnnotator)

const annotatePage = document.createElement('div')
Object.assign(annotatePage, {
  style:
    'align-items: center; display: -webkit-flex; flex-direction: column; left: 50%; pointer-events: none; position: absolute; top: 50%; z-index: 2147483647;',
})

const toolbarX = document.createElement('div')

Object.assign(toolbarX, {
  style:
    'align-items: center; background-color: white; border-radius: 2px; box-shadow: rgba(0, 0, 0, 0.14) 0px 24px 38px 3px, rgba(0, 0, 0, 0.12) 0px 9px 46px 8px, rgba(0, 0, 0, 0.2) 0px 11px 15px -7px; cursor: -webkit-grabbing; display: -webkit-inline-flex; flex-direction: row; height: 56px; min-width: 232px; pointer-events: auto;',
})

toolbarX.innerHTML = `
  <div aria-describedby="24ACF1D5-CD5B-4852-B8D4-2C744B460F1E" role="button" style="cursor: -webkit-grab; height: 56px; padding: 0px 12px; position: relative;">
    <svg aria-label="Drag" height="56" viewbox="-2 2 12 12" width="16" xmlns="https://www.w3.org/2000/svg">
    <circle cx="1.5" cy="1.5" r="1.5"></circle>
    <circle cx="1.5" cy="7.5" r="1.5"></circle>
    <circle cx="1.5" cy="13.5" r="1.5"></circle>
    <circle cx="6.5" cy="1.5" r="1.5"></circle>
    <circle cx="6.5" cy="7.5" r="1.5"></circle>
    <circle cx="6.5" cy="13.5" r="1.5"></circle></svg>
    <div id="24ACF1D5-CD5B-4852-B8D4-2C744B460F1E" style="background-color: rgb(97, 97, 97); border-radius: 2px; box-sizing: border-box; color: white; display: none; left: 50%; font: 400 14px / 20px Roboto, RobotoDraft, Helvetica, Arial, sans-serif; height: 32px; opacity: 0.9; padding: 6px 16px; position: absolute; top: 70px; transform: translateX(-50%); white-space: nowrap;">
      Move toolbar
    </div>
  </div>
  <button aria-describedby="C9414BB2-2871-4710-9A2D-33A9D71BDC4F" aria-pressed="true" style="align-items: center; background-color: rgb(224, 224, 224); border: none; box-sizing: border-box; cursor: pointer; display: -webkit-flex; justify-content: center; outline: none; padding: 10px; pointer-events: auto; position: relative; height: 56px; width: 56px;" type="button">
    <span style="display: inline-block; position: relative; height: 36px; width: 36px;">
      <svg height="36" viewbox="0 0 24 24" width="36" xmlns="https://www.w3.org/2000/svg" fill="rgb(253, 216, 53)">
        <path d="M3 3h18v18H3z"></path>
      </svg>
      <svg aria-label="" height="36" fill="rgb(117, 117, 117)" style="left: 0px; position: absolute; top: 0px;" viewbox="0 0 24 24" width="36" xmlns="https://www.w3.org/2000/svg">
        <path d="M21 17h-2.58l2.51 2.56c-.18.69-.73 1.26-1.41 1.44L17 18.5V21h-2v-6h6v2zM19 7h2v2h-2V7zm2-2h-2V3.08c1.1 0 2 .92 2 1.92zm-6-2h2v2h-2V3zm4 8h2v2h-2v-2zM9 21H7v-2h2v2zM5 9H3V7h2v2zm0-5.92V5H3c0-1 1-1.92 2-1.92zM5 17H3v-2h2v2zM9 5H7V3h2v2zm4 0h-2V3h2v2zm0 16h-2v-2h2v2zm-8-8H3v-2h2v2zm0 8.08C3.9 21.08 3 20 3 19h2v2.08z"></path>
      </svg>
    </span>
  </button>
  <div id="C9414BB2-2871-4710-9A2D-33A9D71BDC4F" style="background-color: rgb(97, 97, 97); border-radius: 2px; box-sizing: border-box; color: white; display: none; left: 50%; font: 400 14px / 20px Roboto, RobotoDraft, Helvetica, Arial, sans-serif; height: 32px; opacity: 0.9; padding: 6px 16px; position: absolute; top: 70px; transform: translateX(-50%); white-space: nowrap;">
    Highlight issues
  </div>
  <button aria-describedby="6C6E5404-1210-4D79-B0A8-DDA9FDB6ACA4" aria-pressed="false" style="align-items: center; background-color: rgb(255, 255, 255); border: none; box-sizing: border-box; cursor: pointer; display: -webkit-flex; justify-content: center; outline: none; padding: 10px; pointer-events: auto; position: relative; height: 56px; width: 56px;" type="button">
    <span style="display: inline-block; position: relative; height: 36px; width: 36px;">
      <svg height="36" viewbox="0 0 24 24" width="36" xmlns="https://www.w3.org/2000/svg">
        <path d="M3 3h18v18H3z"></path>
      </svg>
    </span>
  </button>
  <div id="6C6E5404-1210-4D79-B0A8-DDA9FDB6ACA4" style="background-color: rgb(97, 97, 97); border-radius: 2px; box-sizing: border-box; color: white; display: none; left: 50%; font: 400 14px / 20px Roboto, RobotoDraft, Helvetica, Arial, sans-serif; height: 32px; opacity: 0.9; padding: 6px 16px; position: absolute; top: 70px; transform: translateX(-50%); white-space: nowrap;">
    Hide sensitive info
  </div>
  <label style="align-items: center; align-self: stretch; box-sizing: border-box; cursor: pointer; display: -webkit-inline-flex; min-height: 48px; padding: 0px 8px; color: rgb(66, 133, 244); pointer-events: auto;"><button style="background-color: transparent; border-color: transparent; border-radius: 2px; box-sizing: border-box; color: inherit; cursor: pointer; font: 500 14px / 20px Roboto, RobotoDraft, Helvetica, Arial, sans-serif; height: 36px; margin: 0px; min-width: 64px; opacity: 1; outline: none; padding: 0px 8px;" type="button"><label style="align-items: center; align-self: stretch; box-sizing: border-box; cursor: pointer; display: -webkit-inline-flex; min-height: 48px; padding: 0px 8px; color: rgb(66, 133, 244); pointer-events: auto;"><span style="pointer-events: none;">DONE</span></label></button></label>
`

// const grip = document.createElement('div')
// grip.setAttribute('role', 'button')
// Object.assign(grip, { style: "cursor: -webkit-grabbing; height: 56px; padding: 0px 12px; position: relative" })

// grip.innerHTML = '<svg xmlns="https://www.w3.org/2000/svg" focusable="false" aria-label="Drag" fill="#BDBDBD" height="56" width="16" viewBox="-2 2 12 12"><circle cx="1.5" cy="1.5" r="1.5"></circle><circle cx="1.5" cy="7.5" r="1.5"></circle><circle cx="1.5" cy="13.5" r="1.5"></circle><circle cx="6.5" cy="1.5" r="1.5"></circle><circle cx="6.5" cy="7.5" r="1.5"></circle><circle cx="6.5" cy="13.5" r="1.5"></circle></svg><div id="261D8477-780A-4BCE-8435-7AC72544F885" key="tooltip" style="background-color: rgb(97, 97, 97); border-radius: 2px; box-sizing: border-box; color: white; display: none; left: 50%; font: 400 14px / 20px Roboto, RobotoDraft, Helvetica, Arial, sans-serif; height: 32px; opacity: 0.9; padding: 6px 16px; position: absolute; top: 70px; transform: translateX(-50%); white-space: nowrap;">Move toolbar</div></div>'

// const highlightButton = document.createElement('button')
// highlightButton.innerHTML = 'Highlight'
// highlightButton.onclick = function() {
//   debugger
// }

// const blackoutButton = document.createElement('button')
// blackoutButton.innerHTML = 'Blackout'
// blackoutButton.onclick = function() {
//   debugger
// }

// const doneButton = document.createElement('button')
// doneButton.innerHTML = 'Done'
// doneButton.onclick = function() {
//   debugger
// }

annotatePage.appendChild(toolbarX)

// toolbarX.appendChild(grip)
// toolbarX.appendChild(doneButton)

document.body.appendChild(annotatePage)

document.addEventListener('mouseover', event => {
  console.log('mouseover', event.target)
})

document.addEventListener('mouseout', event => {
  console.log('mouseout', event.target)
})
