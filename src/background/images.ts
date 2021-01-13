import { dispatch } from './store'

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

export async function takeScreenshot(target: FeedbackTarget): Promise<void> {
  try {
    dispatch('imageCaptureStart', { targetId: target.id })
    const tab = target
    const gettingTab = browser.tabs.get(tab.id)
    const screenshotUri = await browser.tabs.captureVisibleTab({ format: 'png' } as any)
    const moreTabInfo = await gettingTab

    const screenshotBlob = dataURItoBlob(screenshotUri)

    dispatch('imageCaptureSuccess', {
      image: {
        type: 'screenshot',
        tab: {
          id: tab.id,
          url: tab.parsedUrl!.fullWithoutQuery,
          width: moreTabInfo.width!,
          height: moreTabInfo.height!,
        },
        name: `${tab.parsedUrl!.host} - ${new Date().toISOString()}.png`,
        uri: screenshotUri,
        blob: screenshotBlob,
      },
      targetId: tab.id,
    })
  } catch (error) {
    global.CONSOLE_ERROR(error)
    dispatch('imageCaptureFailure', {
      targetId: target.id,
      failure: {
        reason: 'unknown',
        message: error.message,
      },
    })
  }
}

export async function imageUpload(targetId: FeedbackTargetId, file: File): Promise<void> {
  try {
    dispatch('imageCaptureStart', { targetId })
    const fiveMegabytes = 5 * Math.pow(2, 20)
    if (file.size > fiveMegabytes) {
      return dispatch('imageCaptureFailure', {
        targetId,
        failure: {
          reason: 'file size limit exceeded',
          message: 'Image is greater than five megabyte limit. Please choose a smaller image and try again',
        },
      })
    }
    const uri = await readFileUri(file)
    const blob = dataURItoBlob(uri)

    dispatch('imageCaptureSuccess', {
      targetId,
      image: { type: 'imageupload', name: file.name, uri, blob },
    })
  } catch (error) {
    global.CONSOLE_ERROR(error)
    dispatch('imageCaptureFailure', {
      targetId,
      failure: {
        reason: 'unknown',
        message: error.message,
      },
    })
  }
}
