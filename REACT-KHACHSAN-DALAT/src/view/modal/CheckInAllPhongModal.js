import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
    CModalFooter,
    CSpinner,
    CToast,
    CToastBody,
    CToaster,
    CToastHeader,
    CFormLabel,
    CAlert,
} from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faClock } from '@fortawesome/free-solid-svg-icons'
import { updateNhanPhongBooking } from 'src/service/XepPhongBooKingService'
import { useNavigate } from 'react-router-dom'
import CurrencyInput from 'react-currency-input-field'

const CheckInAllPhongModal = ({ visible, onClose, ma_bookking }) => {
    const navigate = useNavigate()

    const [trangthaiload, setTrangthaiload] = useState(false)
    const [phuPhiCheckInSom, setPhuPhiCheckInSom] = useState('')
    const [checkInStatus, setCheckInStatus] = useState({
        isLate: false,
        isEarly: false,
        message: '',
        alertType: 'info',
    })

    // Kiểm tra thời gian check-in khi modal mở
    useEffect(() => {
        if (visible) {
            checkCheckInTime()
        } else {
            // Reset state khi modal đóng
            setPhuPhiCheckInSom('')
            setCheckInStatus({
                isLate: false,
                isEarly: false,
                message: '',
                alertType: 'info',
            })
        }
    }, [visible])

    const checkCheckInTime = () => {
        const now = new Date()
        const currentHour = now.getHours()

        // Check-in trễ: sau 14:00 (2 PM)
        if (currentHour >= 14) {
            setCheckInStatus({
                isLate: true,
                isEarly: false,
                message: '⚠️ Cảnh báo: Check-in trễ! Khách đã đến sau giờ check-in chuẩn (14:00).',
                alertType: 'warning',
            })
        }
        // Check-in sớm: trước 13:00 (1 PM)
        else if (currentHour < 13) {
            setCheckInStatus({
                isLate: false,
                isEarly: true,
                message: 'ℹ️ Thông báo: Check-in sớm! Khách đến trước giờ check-in chuẩn (13:00).',
                alertType: 'info',
            })
        }
        // Check-in đúng giờ: từ 13:00 đến 14:00
        else {
            setCheckInStatus({
                isLate: false,
                isEarly: false,
                message: '✔️ Check-in đúng giờ! Khách đến trong khung giờ check-in chuẩn.',
                alertType: 'success',
            })
        }
    }

    const onClickDaNhanPhong = async (ma_bookking) => {
        if (ma_bookking === null || ma_bookking === undefined) {
            return addToast(exampleToast('⚠️ Mã booking hiện không hợp lệ'))
        } else {
            try {
                setTrangthaiload(true)

                // Chuẩn bị dữ liệu check-in

                const phuThuCheckInSom = phuPhiCheckInSom === '' ? 0 : phuPhiCheckInSom

                // 5. Gọi API nếu dữ liệu hợp lệ
                const response = await updateNhanPhongBooking(
                    ma_bookking,
                    true,
                    phuThuCheckInSom,
                    navigate,
                )

                console.log('createXepPhongBooking successfully:', response)
                setTrangthaiload(false)
                // 6. Kiểm tra mã phản hồi từ server
                if ([400, 500].includes(response.code)) {
                    return addToast(exampleToast(response.message))
                }

                if (response.code === 200) {
                    if (response.result) {
                        let successMessage = '✔️ Check-In nhận phòng thành công '
                        if (checkInStatus.isEarly && phuPhiCheckInSom) {
                            successMessage += ` (Phụ phí check-in sớm: ${phuPhiCheckInSom})`
                        }
                        addToast(exampleToast(successMessage))

                    } else {
                        addToast(exampleToast('❌ Check-In nhận phòng lỗi'))
                    }
                }
            } catch (error) {
                console.error('Error:', error)
                setTrangthaiload(false)
                // 7. Xử lý lỗi khi gọi API
                if (error.response) {
                    const { status, data } = error.response

                    if (status === 500) {
                        addToast(exampleToast('❌ Thêm không thành công. Internal Server Error!'))
                    } else if (data?.message) {
                        addToast(exampleToast(`❌ ${data.message}`))
                    } else {
                        addToast(exampleToast('❌ Đã xảy ra lỗi không xác định!'))
                    }
                } else {
                    addToast(exampleToast('❌ Lỗi kết nối đến server'))
                }
            }
        }
    }

    const [toast, addToast] = useState(0)
    const toaster = useRef()
    const exampleToast = (message) => (
        <CToast>
            <CToastHeader closeButton>
                <svg
                    className="rounded me-2"
                    width="20"
                    height="20"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid slice"
                    focusable="false"
                    role="img"
                >
                    <rect width="100%" height="100%" fill="#007aff"></rect>
                </svg>
                <div className="fw-bold me-auto">Thông báo</div>
                <small>Thông báo biến mất sau 5 giây</small>
            </CToastHeader>
            <CToastBody>{message}</CToastBody>
        </CToast>
    )

    return (
        <>
            <>
                <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
            </>

            <CModal
                alignment="center"
                visible={visible}
                onClose={onClose}
                aria-labelledby="LiveDemoExampleLabel"
            >
                <CModalHeader>
                    <CModalTitle id="LiveDemoExampleLabel" className="font-bold text-red-500">
                        Thông báo
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <h4 className="mb-3">
                        Bạn có muốn <span className="text-red-500">check-in</span> nhận phòng
                    </h4>

                    {/* Hiển thị thông báo về thời gian check-in */}
                    {checkInStatus.message && (
                        <CAlert color={checkInStatus.alertType} className="mb-3">
                            <div className="d-flex align-items-center">
                                {checkInStatus.isEarly && <FontAwesomeIcon icon={faClock} className="me-2" />}
                                <span>{checkInStatus.message}</span>
                            </div>
                        </CAlert>
                    )}

                    {/* Input phụ phí check-in sớm */}

                    <div className="mb-3">
                        <CFormLabel htmlFor="phuPhiCheckInSom" className="fw-bold">
                            Phụ thu check-in sớm (VNĐ):
                        </CFormLabel>
                        <CurrencyInput
                            id="phuPhiCheckInSom"
                            name="phuPhiCheckInSom"
                            placeholder="Nhập số tiền phụ thu..."
                            value={phuPhiCheckInSom}
                            onValueChange={(value) => setPhuPhiCheckInSom(value || '')}
                            prefix=""
                            // suffix=" VNĐ"
                            decimalsLimit={0}
                            allowNegativeValue={false}
                            className="form-control"
                            style={{
                                fontSize: '14px',
                                padding: '8px 12px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                            }}
                        />
                        <small className="text-muted">
                            Nhập số tiền phụ phí nếu khách check-in sớm (tùy chọn)
                        </small>
                    </div>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={onClose} variant="outline">
                        Không
                    </CButton>
                    {!trangthaiload && (
                        <CButton
                            color="success"
                            className="text-white px-3"
                            onClick={() => onClickDaNhanPhong(ma_bookking)}
                        >
                            <FontAwesomeIcon icon={faCheck} /> Đồng ý
                        </CButton>
                    )}
                    {trangthaiload && (
                        <CButton color="success" disabled>
                            <CSpinner as="span" size="sm" aria-hidden="true" />
                            Đồng ý...
                        </CButton>
                    )}
                </CModalFooter>
            </CModal>
        </>
    )
}

CheckInAllPhongModal.propTypes = {
    visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
    onClose: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
    ma_bookking: PropTypes.string,
}
export default CheckInAllPhongModal
