let darkMode = false

const human_blue = '#164176'
const human_pink = '#fa759e'
const white = '#ffffff'

const darkModeColors = {
  '--background-color': human_blue,
  '--text-color': white,
  '--post-btn-background-color': human_pink,
  '--post-btn-text-color': human_blue,
  '--image-border-color': human_pink,
}

const lightModeColors: typeof darkModeColors = {} as any
for (const name of Object.keys(darkModeColors)) {
  const color = document.documentElement.style.getPropertyValue(name)
  lightModeColors[name] = color
}

export function setDarkMode(nextDarkMode: boolean) {
  if (darkMode === nextDarkMode) return
  darkMode = nextDarkMode

  const theme = darkMode ? darkModeColors : lightModeColors

  for (const [name, value] of Object.entries(theme)) {
    document.documentElement.style.setProperty(name, value)
  }
}
