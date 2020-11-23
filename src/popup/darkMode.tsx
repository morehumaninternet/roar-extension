export function darkMode(popupWindow: Window) {
  let darkMode = false

  const human_blue = '#164176'
  const human_pink = '#fa759e'
  const white = '#ffffff'

  // See scss/colors.scss
  const darkModeColors = {
    '--background-color': human_blue,
    '--text-color': white,
    '--post-btn-background-color': human_pink,
    '--post-btn-text-color': human_blue,
    '--image-border-color': human_pink,
    '--emoji-picker-border-color': 'transparent',
  }

  const lightModeColors: typeof darkModeColors = {} as any
  for (const name of Object.keys(darkModeColors)) {
    const color = popupWindow.document.documentElement.style.getPropertyValue(name)
    // if (!color) throw new Error(`Expected variable to be defined ${name}`)
    lightModeColors[name] = color
  }

  return function setDarkMode(nextDarkMode: boolean) {
    if (darkMode === nextDarkMode) return
    darkMode = nextDarkMode

    const theme = darkMode ? darkModeColors : lightModeColors

    for (const [name, value] of Object.entries(theme)) {
      popupWindow.document.documentElement.style.setProperty(name, value)
    }
  }
}
