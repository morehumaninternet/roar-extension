export const domainOf = (url: string | undefined): undefined | string => {
  if (url && url.startsWith('http')) {
    const { host } = new URL(url)
    return host.replace(/^www\./, '')
  }
}
