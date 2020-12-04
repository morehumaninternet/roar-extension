import * as React from 'react'
import { Editor, EditorState, CompositeDecorator } from 'draft-js'
import { fromText } from '../../draft-js-utils'
import Tippy from '@tippyjs/react'

type FeedbackEditorProps = {
  editorState: EditorState
  hovering: FeedbackState['hovering']
  updateEditorState: Dispatchers<UserAction>['updateEditorState']
  hoverOver: Dispatchers<UserAction>['hoverOver']
}

const styleMap = {
  'HUMAN-PINK': {
    color: '#fa759e', // TODO - import human pink
  },
}

function hasParent(possibleChild: HTMLElement, possibleParent: HTMLElement | string): boolean {
  let test: null | HTMLElement = possibleChild // tslint:disable-line:no-let

  while (test) {
    if (typeof possibleParent === 'string') {
      if (test.matches(possibleParent)) return true
    } else {
      if (test === possibleParent) return true
    }

    test = test.parentElement // tslint:disable-line:no-expression-statement
  }

  return false
}

export function FeedbackEditor({ editorState, hovering, updateEditorState, hoverOver }: FeedbackEditorProps): JSX.Element {
  const HANDLE_REGEX = /\@[\w\.\-]+/g

  function findWithRegex(regex: any, contentBlock: any, callback: any): any {
    const text = contentBlock.getText()
    let matchArr: any // tslint:disable-line
    let start: any // tslint:disable-line
    while ((matchArr = regex.exec(text)) !== null) {
      start = matchArr.index
      callback(start, start + matchArr[0].length)
    }
  }

  function handleStrategy(contentBlock, callback, contentState): any {
    findWithRegex(HANDLE_REGEX, contentBlock, callback)
  }

  const TwitterLink = ({ url }: { url: string }): JSX.Element => {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        Take me to Twitter
      </a>
    )
  }

  React.useEffect(() => {
    const listener = event => {
      if (hasParent(event.target, '.foo')) {
        const hoverElement = event.target as HTMLElement
        const { height, width, top, left } = hoverElement.getBoundingClientRect()
        hoverOver({ hovering: { active: true, height, width, top, left } })
      } else if (!hasParent(event.target, '.awesome-tippy')) {
        hoverOver({ hovering: { active: false } })
      }
    }

    window.addEventListener('mouseover', listener)
    return () => window.removeEventListener('mouseover', listener)
  })

  const HandleSpan = props => {
    const url = 'https://nytimes.com'
    return <span className="foo">{props.children}</span>
  }

  const onlyHashtags = new CompositeDecorator([{ strategy: handleStrategy, component: HandleSpan }])

  const nextEditorState = EditorState.set(editorState, { decorator: onlyHashtags })

  return (
    <>
      <Editor
        placeholder="What's your feedback?"
        editorState={nextEditorState}
        onChange={editorState => updateEditorState({ editorState })}
        // customStyleMap={styleMap}
      />
      <Tippy
        className="awesome-tippy"
        visible={hovering.active}
        theme="light"
        interactive
        arrow={false}
        offset={[0, 0]}
        content={<TwitterLink url="https://google.com" />}
      >
        <div
          className="link-tooltip-positioner"
          style={{
            height: hovering.height,
            width: hovering.width,
            top: hovering.top,
            left: hovering.left,
          }}
        />
      </Tippy>
    </>
  )
}
