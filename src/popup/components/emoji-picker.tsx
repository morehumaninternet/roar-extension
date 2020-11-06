import * as React from 'react'
import { Picker } from 'emoji-mart'

type EmojiPickerProps = {
  pickingEmoji: boolean
  dispatchUserActions: DispatchUserActions
}

export function EmojiPicker({ pickingEmoji, dispatchUserActions }: EmojiPickerProps) {
  const ref = React.useRef<HTMLDivElement>()

  React.useEffect(() => {
    function listener() {
      const bodyHeight = getComputedStyle(window.document.body).height
      const bodyHeightPx = Number(bodyHeight.match(/^(\d+)px$/)![1])
      const emojiMartScroll = ref.current!.querySelector('.emoji-mart-scroll')! as HTMLDivElement
      emojiMartScroll.style.height = `${bodyHeightPx - 84}px`
    }

    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  })

  return (
    <div ref={ref as any} className={`emoji-picker-container ${pickingEmoji ? 'open' : 'closed'}`}>
      <Picker
        style={{ width: '100%', height: '100%', border: 'none', borderRadius: 0 }}
        title="Pick your emoji…"
        onSelect={(emoji: any) => dispatchUserActions.emojiPicked(emoji.native)}
      />
    </div>
  )
}
