import * as React from 'react'
import { Picker } from 'emoji-mart'

type EmojiPickerProps = {
  pickingEmoji: boolean
  dispatchUserActions: DispatchUserActions
}

function getPixels(el: Element, prop: 'height' | 'width'): number {
  return Number(getComputedStyle(el)[prop].match(/^(\d+)px$/)![1])
}

export function EmojiPicker({ pickingEmoji, dispatchUserActions }: EmojiPickerProps) {
  const ref = React.useRef<HTMLDivElement>()

  React.useEffect(() => {
    // On resize, calculate the distance to the bottom for .emoji-mart-scroll and
    // explicitly increase its height that distance
    function listener() {
      const emojiMartScroll = ref.current!.querySelector('.emoji-mart-scroll')! as HTMLDivElement

      const bodyBottom = window.document.body.getBoundingClientRect().bottom
      const emojiMartScrollBottom = emojiMartScroll.getBoundingClientRect().bottom
      const emojiMartScrollDistanceFromBottom = bodyBottom - emojiMartScrollBottom

      const emojiMartScrollCurrentHeight = getPixels(emojiMartScroll, 'height')
      const emojiMartScrollNextHeight = emojiMartScrollCurrentHeight + emojiMartScrollDistanceFromBottom

      emojiMartScroll.style.height = `${emojiMartScrollNextHeight}px`
    }

    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  })

  return (
    <div ref={ref as any} className={`emoji-picker-container ${pickingEmoji ? 'open' : 'closed'}`}>
      <Picker
        style={{ width: '100%', border: 'none', borderRadius: 0 }}
        title="Pick your emoji…"
        onSelect={(emoji: any) => dispatchUserActions.emojiPicked(emoji.native)}
      />
    </div>
  )
}
