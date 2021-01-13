export const alerts = {
  standard: `Something went wrong. Please try again.`,
  unauthorized: 'Your session ended. Please log in again.',
  'service down': 'Twitter appears to be having an issue. Please try again later.',
  'server error': 'Roar encountered a problem. Please try again later.',
  timeout: `That took too long. Please try again.`,
  'network down': 'You are offline. Please check your network connection and try again.',
}

export const fetchWebsiteFailure = (domain: string) => `We tried to fetch the twitter handle for ${domain} but something went wrong.`

export const onLogin = {
  title: 'Successful login',
  message: "You're authenticated! Click the Roar icon to start giving feedback",
}
