import * as React from 'react'
import { Stage, Layer, Rect, Text, Image } from 'react-konva'
import Konva from 'konva'

class ColoredRect extends React.Component {
  state = {
    color: 'green',
  }
  handleClick = () => {
    this.setState({
      color: Konva.Util.getRandomColor(),
    })
  }
  render() {
    return <Rect x={20} y={20} width={50} height={50} fill={this.state.color} shadowBlur={5} onClick={this.handleClick} />
  }
}

export function EditingScreenshot({ color, screenshot }: EditingScreenshotState): JSX.Element {
  const img = document.createElement('img')
  img.src = screenshot.uri

  screenshot.tab.height

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text text="Try click on rect" />
        <Image image={img} x={0} y={0} width={50} height={50} draggable={false} />
        <ColoredRect />
      </Layer>
    </Stage>
  )
}
