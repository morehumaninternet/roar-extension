import * as React from 'react'
import { Stage, Layer, Rect, Text, Image } from 'react-konva'
// import Konva from 'konva'

// class ColoredRect extends React.Component {
//   state = {
//     color: 'green',
//   }
//   handleClick = () => {
//     this.setState({
//       color: Konva.Util.getRandomColor(),
//     })
//   }
//   render() {
//     return <Rect x={20} y={20} width={50} height={50} fill={this.state.color} shadowBlur={5} onClick={this.handleClick} />
//   }
// }

type EditingScreenshotProps = EditingScreenshotState & {
  stopEditingScreenshot(): void
}

function BackButton({ onClick }: { onClick: () => void }): JSX.Element {
  return (
    <button className="back-button" onClick={onClick}>
      <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="icons8-back_arrow 1">
          <path
            id="Vector"
            d="M25 2C12.3086 2 2 12.3086 2 25C2 37.6914 12.3086 48 25 48C37.6914 48 48 37.6914 48 25C48 12.3086 37.6914 2 25 2ZM25 4C36.6094 4 46 13.3906 46 25C46 36.6094 36.6094 46 25 46C13.3906 46 4 36.6094 4 25C4 13.3906 13.3906 4 25 4ZM20.875 16C20.6523 16.0234 20.4414 16.125 20.2812 16.2812L12.4375 24.1562L12.3438 24.1875C12.3203 24.207 12.3008 24.2266 12.2812 24.25V24.2812C12.2578 24.3008 12.2383 24.3203 12.2188 24.3438C12.1953 24.3633 12.1758 24.3828 12.1562 24.4062C12.1562 24.418 12.1562 24.4258 12.1562 24.4375C12.1328 24.457 12.1133 24.4766 12.0938 24.5C12.0938 24.5117 12.0938 24.5195 12.0938 24.5312C12.0312 24.6367 11.9883 24.7539 11.9688 24.875C11.9688 24.8867 11.9688 24.8945 11.9688 24.9062C11.9688 24.9375 11.9688 24.9688 11.9688 25C11.9688 25.0195 11.9688 25.043 11.9688 25.0625C11.9688 25.0742 11.9688 25.082 11.9688 25.0938C11.9844 25.2266 12.0273 25.3516 12.0938 25.4688C12.1016 25.4883 12.1133 25.5117 12.125 25.5312C12.1367 25.543 12.1445 25.5508 12.1562 25.5625C12.1641 25.582 12.1758 25.6055 12.1875 25.625C12.1992 25.6367 12.207 25.6445 12.2188 25.6562C12.2305 25.668 12.2383 25.6758 12.25 25.6875C12.2617 25.6992 12.2695 25.707 12.2812 25.7188C12.3359 25.7773 12.3984 25.832 12.4688 25.875L20.2812 33.7188C20.6797 34.1172 21.3203 34.1172 21.7188 33.7188C22.1172 33.3203 22.1172 32.6797 21.7188 32.2812L15.4375 26H37C37.3594 26.0039 37.6953 25.8164 37.8789 25.5039C38.0586 25.1914 38.0586 24.8086 37.8789 24.4961C37.6953 24.1836 37.3594 23.9961 37 24H15.4375L21.7188 17.7188C22.043 17.418 22.1289 16.9414 21.9336 16.5469C21.7422 16.1484 21.3086 15.9297 20.875 16Z"
            fill="#FA759E"
          />
        </g>
      </svg>
    </button>
  )
}

function EditingBar({ stopEditingScreenshot }: { stopEditingScreenshot: () => void }): JSX.Element {
  return (
    <div className="editing-bar">
      <BackButton onClick={stopEditingScreenshot} />
    </div>
  )
}

export function EditingScreenshot({ color, screenshot, stopEditingScreenshot }: EditingScreenshotProps): JSX.Element {
  const img = document.createElement('img')
  img.src = screenshot.uri

  const stageWidth = window.innerWidth
  const stageHeight = window.innerHeight * 0.85

  return (
    <div className="editing-screenshot">
      <EditingBar stopEditingScreenshot={stopEditingScreenshot} />
      <Stage width={stageWidth} height={stageHeight}>
        <Layer>
          <Image image={img} x={0} y={0} width={stageWidth} height={stageHeight} draggable={false} />
        </Layer>
      </Stage>
    </div>
  )
}
