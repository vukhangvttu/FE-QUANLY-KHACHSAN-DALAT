import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { CFormTextarea, CModalFooter } from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons'

const GhiChuModal = ({ visible, onClose, maDichVu, initialNote, tenDichVu, onSubmit }) => {
  const [note, setNote] = useState('')

  useEffect(() => {
    if (initialNote) {
      setNote(initialNote)
    }
  }, [initialNote])

  const handleSave = () => {
    const data = {
      maDichVu: maDichVu,
      ghiChu: note,
    }

    setNote('')
    onClose()
    onSubmit(data)
  }

  return (
    <>
      <CModal
        alignment="center"
        backdrop="static"
        visible={visible}
        onClose={onClose}
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel" className="font-bold">
            Ghi chú {tenDichVu}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormTextarea
            id="exampleFormControlTextarea1"
            rows={3}
            placeholder="Nhập ghi chú"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
          ></CFormTextarea>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Đóng
          </CButton>
          <CButton color="success" className="text-white px-4" onClick={handleSave}>
            <FontAwesomeIcon icon={faFloppyDisk} /> Lưu
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

GhiChuModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  maDichVu: PropTypes.string,
  tenDichVu: PropTypes.string,
  initialNote: PropTypes.string,
  onSubmit: PropTypes.func,
}

export default GhiChuModal
