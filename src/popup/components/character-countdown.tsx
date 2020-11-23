import * as React from 'react'

export const CharacterCountdown = ({ charactersLeft }: { charactersLeft: number }): JSX.Element => {
  // We draw a progress circle only if the user didn't cross the limit of characters
  const drawCircle = charactersLeft >= 0

  // As the user gets closer to the limit of characters, we will draw a warning circle
  const drawWarningCircle = charactersLeft <= 20

  // We draw the countdown only when the user gets closer to the limit.
  // After the user crossed the limit, we draw the number of excess characters
  const drawCountdown = charactersLeft <= 20
  const drawWarningCountDown = charactersLeft >= 0

  const percentageCompleted = (1 - charactersLeft / 280) * 100
  return (
    <svg viewBox="0 0 36 36" className="circular-chart">
      {drawCircle && (
        <path
          className={drawWarningCircle ? 'circle__warning' : 'circle'}
          strokeDasharray={`${percentageCompleted}, 100`}
          d="M18 2.0845
        a 15.9155 15.9155 0 0 1 0 31.831
        a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      )}
      {drawCountdown && (
        <text x="18" y="22.35" className={drawWarningCountDown ? 'inner-text__warning' : 'inner-text'}>
          {Math.abs(charactersLeft)}
        </text>
      )}
    </svg>
  )
}
