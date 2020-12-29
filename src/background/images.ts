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

function readFileUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function createImages(tabs: typeof browser.tabs, dispatchBackgroundActions: Dispatchers<BackgroundAction>): Images {
  return {
    async takeScreenshot(target: FeedbackTarget): Promise<void> {
      try {
        dispatchBackgroundActions.imageCaptureStart({ targetId: target.id })
        const tab = target
        const gettingTab = tabs.get(tab.id)
        const screenshotUri = await tabs.captureVisibleTab({ format: 'png' } as any)
        const moreTabInfo = await gettingTab

        const screenshotBlob = dataURItoBlob(screenshotUri)
        const domain = domainOf(tab.url)
        dispatchBackgroundActions.imageCaptureSuccess({
          image: {
            type: 'screenshot',
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
          targetId: tab.id,
        })
      } catch (error) {
        global.CONSOLE_ERROR(error)
        dispatchBackgroundActions.imageCaptureFailure({
          targetId: target.id,
          failure: {
            reason: 'unknown',
            message: error.message,
          },
        })
      }
    },

    async imageUpload(targetId: FeedbackTargetId, file: File): Promise<void> {
      try {
        dispatchBackgroundActions.imageCaptureStart({ targetId })
        const fiveMegabytes = 5 * Math.pow(2, 20)
        if (file.size > fiveMegabytes) {
          return dispatchBackgroundActions.imageCaptureFailure({
            targetId,
            failure: {
              reason: 'file size limit exceeded',
              message: 'Image is greater than five megabyte limit. Please choose a smaller image and try again',
            },
          })
        }
        const uri = await readFileUri(file)
        const blob = dataURItoBlob(uri)

        dispatchBackgroundActions.imageCaptureSuccess({
          targetId,
          image: { type: 'imageupload', name: file.name, uri, blob },
        })
      } catch (error) {
        global.CONSOLE_ERROR(error)
        dispatchBackgroundActions.imageCaptureFailure({
          targetId,
          failure: {
            reason: 'unknown',
            message: error.message,
          },
        })
      }
    },
  }
}
