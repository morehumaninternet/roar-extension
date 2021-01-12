export const alerts = {
  standard: `Something went wrong. Please try again.`,
  unauthorized: 'Your session ended. Please log in to try again.',
  'service down': 'Twitter appears to be down. Please try again later.',
  'server error': 'We encountered a problem on our end. Please try again later.',
  timeout: `That took too long. Please try again.`,
  'network down': 'You are offline. Please check your network connection and try again.',
}

export const fetchWebsiteFailure = (domain: string) => `We tried to fetch the twitter handle for ${domain} but something went wrong.`

export const onLogin = {
  title: 'Successful login',
  message: "You're in! Click the icon to start giving feedback",
}
