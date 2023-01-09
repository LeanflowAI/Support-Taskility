import React from 'react'
import Uppy from '@uppy/core'
import Transloadit from '@uppy/transloadit'
import Form from '@uppy/form'
import { DragDrop, Dashboard, StatusBar, ProgressBar, FileInput, DashboardModal } from '@uppy/react'
import { v4 as uuidv4 } from 'uuid'
import '@uppy/core/dist/style.css'
import '@uppy/drag-drop/dist/style.css'
import '@uppy/dashboard/dist/style.css'

export const UploadDashboardT = ({ id = uuidv4(), meta = {}, restrictions = {}, autoProceed = false, templateId = '', processUploadComplete }) => {
  const dragDropT = new Uppy({
    id: id,
    meta: meta,
    restrictions: restrictions,
    autoProceed: autoProceed,
  })

  // dragDropT.use(Form, { getMetaFromForm: true })

  // Upload to Transloadit
  dragDropT.use(Transloadit, {
    getAssemblyOptions(file) {
      return {
        params: {
          auth: { key: '45a4105f1d2e4e28b1d584645140dab5' },
          template_id: templateId,
        },
        fields: {
          caption: file.meta.caption,
        },
      }
    },
    waitForEncoding: true,
  })
  // Manage Transloadit Events
  dragDropT.on('transloadit:complete', assembly => {
    // Could do something fun with this!
    processUploadComplete(assembly.results)
    console.log(assembly.results)
  })
  // Errors Management
  dragDropT.on('error', error => {
    if (error.assembly) {
      console.log(`Assembly ID ${error.assembly.assembly_id} failed!`)
      console.log(error.assembly)
    }
  })

  return <Dashboard uppy={dragDropT} id={`${uuidv4()}-${id}`} key={`${uuidv4()}-${id}`} />
}
