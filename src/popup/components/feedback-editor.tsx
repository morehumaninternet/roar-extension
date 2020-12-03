import * as React from 'react'
import { Editor, EditorState, CompositeDecorator } from 'draft-js'
import { fromText } from '../../draft-js-utils'

type FeedbackEditorProps = {
  editorState: EditorState
  updateEditorState: Dispatchers<UserAction>['updateEditorState']
}

const styleMap = {
  'HUMAN-PINK': {
    color: '#fa759e', // TODO - import human pink
  },
}

export function FeedbackEditor({ updateEditorState }: FeedbackEditorProps): JSX.Element {
  // const ref: any = React.useRef()

  // React.useEffect(() => {
  //   ref.current.editor.addEventListener('click', event => {
  //     debugger
  //   })
  // }, [])

  const editorState = fromText('@coolbro')
  const HANDLE_REGEX = /\@[\w]+/g
  const HASHTAG_REGEX = /\#[\w\u0590-\u05ff]+/g

  function findWithRegex(regex: any, contentBlock: any, callback: any): any {
    const text = contentBlock.getText()
    console.log('here', text)
    let matchArr: any // tslint:disable-line
    let start: any // tslint:disable-line
    while ((matchArr = regex.exec(text)) !== null) {
      console.log('matchArr', matchArr)
      start = matchArr.index
      callback(start, start + matchArr[0].length)
    }
  }

  function handleStrategy(contentBlock, callback, contentState): any {
    findWithRegex(HANDLE_REGEX, contentBlock, callback)
  }

  const HandleSpan = props => {
    console.log('IN HANDLE SPAN', props)
    const url = 'https://nytimes.com'
    return (
      <a
        // href={url}
        target="_blank"
        onClick={(event: any) => {
          chrome.tabs.create({ url, active: true })
        }}
      >
        {props.children}
      </a>
    )
  }

  const onlyHashtags = new CompositeDecorator([
    {
      strategy: handleStrategy,
      component: HandleSpan,
    },
  ])

  const nextEditorState = EditorState.set(editorState, { decorator: onlyHashtags })

  return (
    <Editor
      // ref={ref as any}
      placeholder="What's your feedback?"
      editorState={nextEditorState}
      onChange={editorState => updateEditorState({ editorState })}
      // customStyleMap={styleMap}
    />
  )
}
