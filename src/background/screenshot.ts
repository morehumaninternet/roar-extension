import { domainOf } from './domain'

function dataURItoBlob(dataURI: string): Blob {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  const byteString = atob(dataURI.split(',')[1])

  // separate out the mime component
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)

  // tslint:disable-next-line:no-let
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  // write the ArrayBuffer to a blob, and you're done
  return new Blob([ab], { type: mimeString })
}

export async function takeScreenshot(
  target: FeedbackTarget,
  tabs: typeof browser.tabs,
  dispatchBackgroundActions: Dispatchers<BackgroundAction>
): Promise<void> {
  if (target.feedbackTargetType === 'help') {
    return console.log('TODO take screenshot of popup on help click')
  }
  const tab = target
  try {
    const gettingTab = tabs.get(tab.id)
    const screenshotUri = await tabs.captureVisibleTab({ format: 'png' } as any)
    const moreTabInfo = await gettingTab

    const screenshotBlob = dataURItoBlob(screenshotUri)
    const domain = domainOf(tab.url)
    dispatchBackgroundActions.screenshotCaptureSuccess({
      screenshot: {
        tab: {
          id: tab.id,
          url: tab.url!,
          width: moreTabInfo.width!,
          height: moreTabInfo.height!,
        },
        name: `${domain} - ${new Date().toISOString()}.png`,
        uri: screenshotUri,
        blob: screenshotBlob,
      },
    })
  } catch (error) {
    dispatchBackgroundActions.screenshotCaptureFailure({ error })
  }
}

function readFileAsync(file: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = () => {
      resolve(String(reader.result))
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function imageUpload(tab: TabInfo, tabs: typeof browser.tabs, dispatchBackgroundActions: Dispatchers<BackgroundAction>): Promise<void> {
  try {
    const gettingTab = tabs.get(tab.id)
    const moreTabInfo = await gettingTab
    const file = tab.uploadImageFile
    const uri = await readFileAsync(file)
    const screenshotBlob = dataURItoBlob(uri)
    const { host } = new URL(tab.url!)
    dispatchBackgroundActions.screenshotCaptureSuccess({
      screenshot: {
        tab: {
          id: tab.id,
          url: tab.url!,
          width: moreTabInfo.width!,
          height: moreTabInfo.height!,
        },
        name: `${host} - ${new Date().toISOString()}.png`,
        uri: uri,
        blob: screenshotBlob,
      },
    })
  } catch (error) {
    dispatchBackgroundActions.screenshotCaptureFailure(error)
  }
}
/*
export async function imageUpload(tab: TabInfo, tabs: typeof browser.tabs, dispatchBackgroundActions: Dispatchers<BackgroundAction>): Promise<void> {
  try {
    const gettingTab = tabs.get(tab.id)
    const moreTabInfo = await gettingTab

    const file = tab.uploadImageFile
    const reader = new FileReader()
    reader.addEventListener(
      'load',
      function () {
        // convert image file to base64 string
        const uri = String(reader.result)
        const screenshotBlob = dataURItoBlob(uri)
        const { host } = new URL(tab.url!)
        dispatchBackgroundActions.screenshotCaptureSuccess({
          screenshot: {
            tab: {
              id: tab.id,
              url: tab.url!,
              width: moreTabInfo.width!,
              height: moreTabInfo.height!,
            },
            name: `${host} - ${new Date().toISOString()}.png`,
            uri: uri,
            blob: screenshotBlob,
          },
        })
      },
      false
    )
    reader.readAsDataURL(file)
  } catch (error) {
    dispatchBackgroundActions.screenshotCaptureFailure(error)
  }
}
*/
