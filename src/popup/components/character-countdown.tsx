import * as React from 'react'

export const CharacterCountdown = ({ characterLimit }: { characterLimit: CharacterLimit }): JSX.Element => {
  const { remaining, percentageCompleted } = characterLimit
  // We draw a progress circle only if the user didn't cross the limit of characters
  const drawCircle = remaining >= 0
  // As the user gets closer to the limit of characters, we will draw a warning circle
  const drawWarningCircle = remaining <= 20
  // We draw the countdown only when the user gets closer to the limit.
  // After the user crossed the limit, we draw the number of excess characters
  const drawCountdown = remaining <= 20
  const drawWarningCountDown = remaining >= 0
  const strokeDasharray = 56.5487 // stole from Twitter 🤷‍♀️
  const strokeDashoffset = strokeDasharray - strokeDasharray * (percentageCompleted / 100)
  const radius = 9
  const strokeWidth = 2
  const diameter = 2 * radius + strokeWidth
  return (
    <div
      className="character-countdown"
      title="Characters Remaining"
      role="progressbar"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.min(100, Math.round(percentageCompleted))}
    >
      <svg viewBox={`0 0 ${diameter} ${diameter}`} className={`circular-chart ${drawWarningCircle ? 'warning' : ''}`}>
        {drawCircle && (
          <>
            <circle cx="50%" cy="50%" strokeWidth={strokeWidth} r={radius}></circle>
            <circle
              className="progress"
              cx="50%"
              cy="50%"
              strokeWidth={strokeWidth}
              r={radius}
              transform-origin="center"
              strokeLinecap="round"
              style={{ strokeDashoffset, strokeDasharray, transform: 'rotate(-90deg)' }}
            ></circle>
          </>
        )}
        {drawCountdown && (
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className={drawWarningCountDown ? 'inner-text__warning' : 'inner-text'}>
            {Math.abs(remaining)}
          </text>
        )}
      </svg>
    </div>
  )
}
