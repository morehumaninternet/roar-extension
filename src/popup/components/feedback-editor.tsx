import * as React from 'react'
import { Editor, EditorState, CompositeDecorator } from 'draft-js'

type FeedbackEditorProps = {
  editorState: EditorState
  hovering: FeedbackState['hovering']
  updateEditorState: Dispatchers<UserAction>['updateEditorState']
  hoverOver: Dispatchers<UserAction>['hoverOver']
  handle: Maybe<string>
}

const styleMap = {
  'HUMAN-PINK': {
    color: '#fa759e', // TODO - import human pink
  },
}

const LaunchIcon = (): JSX.Element => {
  return (
    <svg viewBox="0 0 24 24" className="link-tooltip__launch-icon">
      <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
    </svg>
  )
}

const TwitterLink = ({ handle }: { handle: string }): JSX.Element => {
  const url = `https://twitter.com/${handle}`
  return (
    <a className="link-tooltip__anchor" href={url} target="_blank" rel="noopener noreferrer">
      {url}
      <LaunchIcon />
    </a>
  )
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

export function FeedbackEditor({ editorState, hovering, updateEditorState, hoverOver, handle }: FeedbackEditorProps): JSX.Element {
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

  React.useEffect(() => {
    const listener = event => {
      if (hasParent(event.target, '.tooltip-hover-element')) {
        const hoverElement = event.target as HTMLElement
        const { height, width, top, left } = hoverElement.getBoundingClientRect()
        hoverOver({ hovering: { active: true, height, width, top, left } })
      } else if (!hasParent(event.target, '.link-tooltip')) {
        hoverOver({ hovering: { active: false } })
      }
    }

    window.addEventListener('mouseover', listener)
    return () => window.removeEventListener('mouseover', listener)
  })

  const HandleSpan = props => {
    return <span className="tooltip-hover-element">{props.children}</span>
  }

  const onlyHashtags = new CompositeDecorator([{ strategy: handleStrategy, component: HandleSpan }])

  const nextEditorState = EditorState.set(editorState, { decorator: onlyHashtags })

  return (
    <>
      <Editor
        placeholder="What's your feedback?"
        editorState={nextEditorState}
        onChange={editorState => updateEditorState({ editorState })}
        customStyleMap={styleMap}
      />
      {hovering.active && !!handle && (
        <div
          className="link-tooltip"
          style={{
            height: hovering.height,
            width: hovering.width,
            top: hovering.top,
            left: hovering.left,
          }}
        >
          <TwitterLink handle={handle!} />
        </div>
      )}
    </>
  )
}

// TODO - write tests
// TODO - test the we don't show the tooltip if we can't find a handle and we only have a domain
// TODO - test what happens when the handle doesn't exist yet (the status is IN_PROGRESS)
