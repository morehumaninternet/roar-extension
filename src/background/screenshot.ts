function dataURItoBlob(dataURI: string): Blob {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  const byteString = atob(dataURI.split(',')[1])

  // separate out the mime component
  const mimeString = dataURI
    .split(',')[0]
    .split(':')[1]
    .split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    // tslint:disable-line:no-let
    // tslint:disable-line:no-let
    ia[i] = byteString.charCodeAt(i)
  }

  // write the ArrayBuffer to a blob, and you're done
  return new Blob([ab], { type: mimeString })
}

export async function takeScreenshot(tab: TabInfo, tabs: typeof browser.tabs, dispatchBackgroundActions: DispatchBackgroundActions): Promise<void> {
  try {
    const screenshotUri = await tabs.captureVisibleTab({ format: 'png' } as any)
    const screenshotBlob = dataURItoBlob(screenshotUri)
    const { host } = new URL(tab.url!)
    dispatchBackgroundActions.screenshotCaptureSuccess({
      tab,
      name: `${host} - ${new Date().toISOString()}`,
      uri: screenshotUri,
      blob: screenshotBlob
    })
  } catch (error) {
    dispatchBackgroundActions.screenshotCaptureFailure(error)
  }
}
