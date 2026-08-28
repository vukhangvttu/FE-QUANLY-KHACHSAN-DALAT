import React, { useRef, useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTrashCan } from '@fortawesome/free-solid-svg-icons'

/**
 * SignaturePad - Component khung ký chữ ký bằng ngón tay
 * Chỉ hiển thị trên thiết bị di động / máy tính bảng (isMobile).
 *
 * Props:
 *   onSave(dataUrl) - callback khi nhấn "Xác nhận chữ ký", truyền data URL ảnh PNG
 */
const SignaturePad = ({ onSave }) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
  const [savedSignature, setSavedSignature] = useState(null)
  const lastPos = useRef(null)

  // Adjust canvas resolution for high-DPI screens
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ratio = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * ratio
    canvas.height = rect.height * ratio
    const ctx = canvas.getContext('2d')
    ctx.scale(ratio, ratio)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDrawing = useCallback((e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const pos = getPos(e, canvas)
    lastPos.current = pos
    setIsDrawing(true)
    setIsEmpty(false)

    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 1.2, 0, Math.PI * 2)
    ctx.fillStyle = '#000'
    ctx.fill()
  }, [])

  const draw = useCallback(
    (e) => {
      if (!isDrawing) return
      e.preventDefault()
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const pos = getPos(e, canvas)

      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.beginPath()
      ctx.moveTo(lastPos.current.x, lastPos.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()

      lastPos.current = pos
    },
    [isDrawing],
  )

  const stopDrawing = useCallback((e) => {
    e?.preventDefault()
    setIsDrawing(false)
    lastPos.current = null
  }, [])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const ratio = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio)
    setIsEmpty(true)
    setSavedSignature(null)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/png')
    setSavedSignature(dataUrl)
    if (onSave) onSave(dataUrl)
  }

  return (
    <div
      style={{
        marginTop: '24px',
        padding: '16px',
        border: '1px solid #dee2e6',
        borderRadius: '12px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      }}
    >
      {/* Tiêu đề */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '20px' }}>&#9999;&#65039;</span>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#212529' }}>
            Chữ ký khách hàng
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#6c757d' }}>
            Dùng ngón tay ký vào khung bên dưới
          </p>
        </div>
      </div>

      {/* Canvas ký tên */}
      <div
        style={{
          position: 'relative',
          border: '2px dashed #adb5bd',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          overflow: 'hidden',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        {isEmpty && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#ced4da',
              fontSize: '14px',
              pointerEvents: 'none',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '4px' }}>&#9998;</div>
            Ký tên tại đây
          </div>
        )}
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '180px',
            cursor: 'crosshair',
            touchAction: 'none',
          }}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      {/* Nút hành động */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
        <button
          onClick={clearCanvas}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            color: '#dc3545',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <FontAwesomeIcon icon={faTrashCan} /> Xóa
        </button>
        <button
          onClick={handleSave}
          disabled={isEmpty}
          style={{
            flex: 2,
            padding: '10px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: isEmpty ? '#adb5bd' : '#198754',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isEmpty ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          <FontAwesomeIcon icon={faCheck} /> Xác nhận chữ ký
        </button>
      </div>

      {/* Hiển thị chữ ký đã lưu */}
      {savedSignature && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            backgroundColor: '#d4edda',
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#155724', fontSize: '13px' }}>
            Da xac nhan chu ky:
          </p>
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              padding: '8px',
              display: 'inline-block',
            }}
          >
            <img
              src={savedSignature}
              alt="Chu ky khach hang"
              style={{ maxWidth: '100%', maxHeight: '100px', display: 'block' }}
            />
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#6c757d' }}>
            Nhan &ldquo;Xoa&rdquo; roi ky lai neu muon thay doi chu ky
          </p>
        </div>
      )}
    </div>
  )
}

SignaturePad.propTypes = {
  onSave: PropTypes.func,
}

export default SignaturePad
