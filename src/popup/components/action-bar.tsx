import * as React from 'react'

import { EmojiPicker } from './emoji-picker'

const TakeSnapshotButton = () => (
  <button className="svg-btn">
    <svg width="33" height="34" viewBox="0 0 33 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        id="Take Screenshot Button"
        d="M3.62914 0.34021C1.62404 0.34021 0 1.96425 0 3.96935H3.62914V0.34021ZM7.25828 0.34021V3.96935H10.8874V0.34021H7.25828ZM14.5166 0.34021V3.96935H18.1457V0.34021H14.5166ZM21.7748 0.34021V3.96935H25.404V0.34021H21.7748ZM29.0331 0.34021V3.96935H32.6623C32.6623 1.96425 31.0382 0.34021 29.0331 0.34021ZM0 7.59849V11.2276H3.62914V7.59849H0ZM29.0331 7.59849V11.2276H32.6623V7.59849H29.0331ZM16.3311 11.2276L13.9141 14.8568H9.98013C8.47767 14.8568 7.25828 16.0762 7.25828 17.5786V30.2806C7.25828 31.7831 8.47767 33.0025 9.98013 33.0025H29.9404C31.4429 33.0025 32.6623 31.7831 32.6623 30.2806V17.5786C32.6623 16.0762 31.4429 14.8568 29.9404 14.8568H26.0065L23.5894 11.2276H16.3311ZM0 14.8568V18.4859H3.62914V14.8568H0ZM18.2733 14.8568H21.6472L22.9905 16.8698L24.0679 18.4859H26.0065H29.0331V29.3733H10.8874V18.4859H13.9141H15.8527L16.9301 16.8698L18.2733 14.8568ZM19.9603 20.3005C18.9978 20.3005 18.0747 20.6828 17.3941 21.3634C16.7135 22.044 16.3311 22.9671 16.3311 23.9296C16.3311 24.8921 16.7135 25.8152 17.3941 26.4958C18.0747 27.1764 18.9978 27.5588 19.9603 27.5588C20.9228 27.5588 21.8459 27.1764 22.5265 26.4958C23.207 25.8152 23.5894 24.8921 23.5894 23.9296C23.5894 22.9671 23.207 22.044 22.5265 21.3634C21.8459 20.6828 20.9228 20.3005 19.9603 20.3005ZM0 22.115V25.7442H3.62914V22.115H0ZM0 29.3733C0 31.3784 1.62404 33.0025 3.62914 33.0025V29.3733H0Z"
        fill="#FA759E"
      />
    </svg>
  </button>
)

const AddImageButton = () => (
  <button className="svg-btn">
    <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        id="Add Image Button"
        d="M4.99007 0C2.23373 0 0 2.23373 0 4.99007V21.2326L6.80995 14.6459C8.19175 13.3086 10.5361 13.3104 11.9152 14.6459L17.5202 20.0684L19.379 18.2715C20.7563 16.9396 23.1088 16.9396 24.4843 18.2715L32.6623 26.1819V4.99007C32.6623 2.23373 30.4285 0 27.6722 0H4.99007ZM22.2285 6.35099C24.4795 6.35099 26.3113 8.1828 26.3113 10.4338C26.3113 12.6847 24.4795 14.5166 22.2285 14.5166C19.9775 14.5166 18.1457 12.6847 18.1457 10.4338C18.1457 8.1828 19.9775 6.35099 22.2285 6.35099ZM22.2285 9.07285C21.8675 9.07285 21.5214 9.21623 21.2662 9.47145C21.0109 9.72668 20.8675 10.0728 20.8675 10.4338C20.8675 10.7947 21.0109 11.1409 21.2662 11.3961C21.5214 11.6513 21.8675 11.7947 22.2285 11.7947C22.5894 11.7947 22.9356 11.6513 23.1908 11.3961C23.446 11.1409 23.5894 10.7947 23.5894 10.4338C23.5894 10.0728 23.446 9.72668 23.1908 9.47145C22.9356 9.21623 22.5894 9.07285 22.2285 9.07285ZM9.36169 16.34C9.12171 16.34 8.88259 16.4276 8.70249 16.6022L0 25.0194V27.6722C0 30.2716 1.98898 32.406 4.52756 32.6392L15.5638 21.9627L10.0227 16.6022C9.84256 16.4276 9.60167 16.34 9.36169 16.34ZM21.9325 19.9691C21.6915 19.9691 21.4512 20.0555 21.2733 20.2278L8.41719 32.6623H27.6722C29.7462 32.6623 31.5229 31.3958 32.2759 29.5948L22.5935 20.2278C22.4152 20.0555 22.1735 19.9691 21.9325 19.9691Z"
        fill="#FA759E"
      />
    </svg>
  </button>
)

const AddHashtagButton = () => (
  <button className="svg-btn">
    <svg width="35" height="33" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        id="Hashtag Button"
        d="M8.86638 0L8.19662 7.14487H1.81793L1.40331 11.2276H7.8139L6.76141 22.4553H0.382721L0 26.5381H6.37869L5.80461 32.5666V32.6623H9.88697L10.4611 26.5381H21.6875L21.1135 32.5666V32.6623H25.1958L25.7699 26.5381H32.6589L33.0416 22.4553H26.1526L27.2051 11.2276H34.0622L34.4768 7.14487H27.5878L28.2576 0.0956902V0H24.1752L23.5055 7.14487H12.279L12.9487 0.0956902V0H8.86638ZM11.8963 11.2276H23.1228L22.0703 22.4553H10.8438L11.8963 11.2276Z"
        fill="#FA759E"
      />
    </svg>
  </button>
)

type ActionBarProps = {
  clickPost: DispatchUserActions['clickPost']
  emojiPicked(emoji: string): void
}

export const ActionBar = ({ clickPost, emojiPicked }: ActionBarProps) => {
  return (
    <div className="actions-bar">
      <div className="actions">
        <TakeSnapshotButton />
        <AddImageButton />
        <AddHashtagButton />
        <EmojiPicker emojiPicked={emojiPicked} />
      </div>
      <button className="post-btn" onClick={clickPost}>
        Post
      </button>
    </div>
  )
}
