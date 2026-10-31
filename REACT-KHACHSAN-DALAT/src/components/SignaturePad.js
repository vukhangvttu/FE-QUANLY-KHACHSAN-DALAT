import React, { useRef, useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTrashCan, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons'

/**
 * SignaturePad - Component khung ký chữ ký bằng ngón tay hoặc bảng vẽ (Wacom)
 * Hỗ trợ cảm ứng lực (pressure) và ký toàn màn hình (Fullscreen).
 *
 * Props:
 *   onSave(dataUrl) - callback khi nhấn "Xác nhận chữ ký", truyền data URL ảnh PNG
 */
const SignaturePad = ({ onSave }) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
  const [savedSignature, setSavedSignature] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const lastPos = useRef(null)

  // Adjust canvas resolution for high-DPI screens and resizing
  const setupCanvas = useCallback(() => {
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

    setIsEmpty(true)
    setSavedSignature(null)
  }, [])

  useEffect(() => {
    setupCanvas()
    window.addEventListener('resize', setupCanvas)
    return () => window.removeEventListener('resize', setupCanvas)
  }, [setupCanvas, isFullscreen])

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure !== undefined ? e.pressure : 0.5,
      pointerType: e.pointerType || 'mouse'
    }
  }

  const startDrawing = useCallback((e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const pos = getPos(e, canvas)

    // Bỏ qua nếu là chuột (chỉ cho phép bút Wacom hoặc cảm ứng)
    if (pos.pointerType === 'mouse') return

    if (e.pointerId) {
      canvas.setPointerCapture(e.pointerId)
    }

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

      // Bỏ qua nếu là chuột
      if (pos.pointerType === 'mouse') return

      ctx.strokeStyle = '#000000'
      const baseLineWidth = Math.max(2, canvas.clientWidth / 140)

      ctx.lineWidth = (baseLineWidth * 0.4) + (pos.pressure * baseLineWidth * 1)
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
    setupCanvas()
  }

  const handleSave = () => {
    const canvas = canvasRef.current

    // Cắt (crop) khoảng trắng thừa xung quanh chữ ký
    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height
    const imgData = ctx.getImageData(0, 0, w, h)
    const data = imgData.data

    let minX = w, minY = h, maxX = 0, maxY = 0
    let found = false

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const alpha = data[(y * w + x) * 4 + 3]
        if (alpha > 0) {
          if (x < minX) minX = x
          if (y < minY) minY = y
          if (x > maxX) maxX = x
          if (y > maxY) maxY = y
          found = true
        }
      }
    }

    let dataUrl
    if (!found) {
      dataUrl = canvas.toDataURL('image/png')
    } else {
      const padding = 12
      minX = Math.max(0, minX - padding)
      minY = Math.max(0, minY - padding)
      maxX = Math.min(w, maxX + padding)
      maxY = Math.min(h, maxY + padding)

      const cropW = maxX - minX
      const cropH = maxY - minY

      // Giữ nguyên độ phân giải gốc (không scale down) để nét chữ ký giữ nguyên độ đậm nhạt và sắc nét
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = cropW
      tempCanvas.height = cropH
      const tempCtx = tempCanvas.getContext('2d')

      // Nền trắng để nét mực đen tương phản sắc nét
      tempCtx.fillStyle = '#ffffff'
      tempCtx.fillRect(0, 0, cropW, cropH)

      // Khử răng cưa
      tempCtx.imageSmoothingEnabled = true
      tempCtx.imageSmoothingQuality = 'high'
      tempCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH)

      dataUrl = tempCanvas.toDataURL('image/png')
    }

    setSavedSignature(dataUrl)
    if (isFullscreen) {
      setIsFullscreen(false)
    }
    if (onSave) onSave(dataUrl)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (!isFullscreen) {
    return (
      <div style={{
        margin: '24px auto',
        padding: '30px 20px',
        border: '2px dashed #adb5bd',
        borderRadius: '12px',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        width: '80%',
      }}>
        <div style={{ fontSize: '32px', color: savedSignature ? '#198754' : '#495057' }}>
          {savedSignature ? '✅' : '✍️'}
        </div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '18px', color: savedSignature ? '#198754' : '#212529' }}>
          {savedSignature ? 'Đã lưu chữ ký khách hàng' : 'Chữ ký khách hàng'}
        </p>
        <p style={{ margin: 0, fontSize: '14px', color: '#6c757d', textAlign: 'center' }}>
          {savedSignature ? 'Nhấn nút bên dưới nếu bạn muốn ký lại.' : 'Bạn cần mở bảng ký toàn màn hình để ký bằng bút Wacom.'}
        </p>
        <button
          onClick={toggleFullscreen}
          style={{
            marginTop: '10px',
            padding: '16px 32px',
            backgroundColor: savedSignature ? '#198754' : '#0d6efd',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'background-color 0.2s'
          }}
        >
          <FontAwesomeIcon icon={faExpand} />
          {savedSignature ? 'KÝ LẠI (TOÀN MÀN HÌNH)' : 'MỞ BẢNG KÝ (TOÀN MÀN HÌNH)'}
        </button>
      </div>
    )
  }

  // Chế độ Fullscreen
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
    }}>
      {/* Tiêu đề */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>&#9999;&#65039;</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#fff' }}>
              Chữ ký khách hàng
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#ccc' }}>
              Dùng bút Wacom ký vào khung bên dưới
            </p>
          </div>
        </div>

        {/* Nút Đóng */}
        <button
          onClick={toggleFullscreen}
          style={{
            padding: '8px 12px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: '#495057',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <FontAwesomeIcon icon={faCompress} />
          Đóng
        </button>
      </div>

      {/* Canvas ký tên */}
      <div style={{
        flex: 1,
        position: 'relative',
        backgroundColor: '#fff',
        borderRadius: '8px',
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none',
      }}>
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
            height: '100%',
            cursor: 'crosshair',
            touchAction: 'none',
          }}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
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
    </div>
  )
}

SignaturePad.propTypes = {
  onSave: PropTypes.func,
}

export default SignaturePad
