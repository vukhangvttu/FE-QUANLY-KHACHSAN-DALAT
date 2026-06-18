import ExcelJS from 'exceljs'

// Template layout constants
const TEMPLATE_TITLE_ROW = 1      // Row 1: tiêu đề (merge A1:AH1)
const TEMPLATE_ROWS = 26          // Tổng số dòng của 1 khối template
const COL_NGAY_START = 4          // Cột D = Ngày 1
const GAP_ROWS = 2                // Số dòng trống giữa các năm

/**
 * Copy toàn bộ style + value + formula của 1 cell sang cell đích,
 * điều chỉnh row offset trong formula references.
 */
const copyCellTo = (srcCell, dstCell, rowOffset) => {
  // Copy style
  dstCell.style = JSON.parse(JSON.stringify(srcCell.style))

  const val = srcCell.value
  if (val === null || val === undefined) {
    dstCell.value = null
    return
  }

  // Điều chỉnh formula — thay số dòng trong cell references
  if (val && typeof val === 'object' && (val.formula || val.sharedFormula)) {
    const shiftFormula = (f) =>
      f.replace(/([A-Z]+)(\d+)/g, (_, col, row) => `${col}${parseInt(row) + rowOffset}`)

    if (val.formula) {
      dstCell.value = { formula: shiftFormula(val.formula) }
    } else {
      dstCell.value = { formula: shiftFormula(val.sharedFormula) }
    }
  } else {
    dstCell.value = val
  }
}

/**
 * Copy 1 khối template (row srcStart .. srcEnd) xuống offset dstStart,
 * bao gồm row heights, merges và tất cả cell style/formula.
 */
const copyTemplateBlock = (ws, srcStart, srcEnd, dstStart) => {
  const rowOffset = dstStart - srcStart

  for (let r = srcStart; r <= srcEnd; r++) {
    const srcRow = ws.getRow(r)
    const dstRow = ws.getRow(r + rowOffset)

    // Copy row height
    dstRow.height = srcRow.height

    srcRow.eachCell({ includeEmpty: true }, (srcCell, col) => {
      const dstCell = dstRow.getCell(col)
      copyCellTo(srcCell, dstCell, rowOffset)
    })
  }

  // Copy merges trong vùng srcStart..srcEnd, dịch chuyển row
  const existingMerges = ws.model.merges || []
  existingMerges.forEach((mergeStr) => {
    const match = mergeStr.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/)
    if (!match) return
    const r1 = parseInt(match[2])
    const r2 = parseInt(match[4])
    if (r1 >= srcStart && r2 <= srcEnd) {
      const newMerge = `${match[1]}${r1 + rowOffset}:${match[3]}${r2 + rowOffset}`
      try { ws.mergeCells(newMerge) } catch (_) {}
    }
  })
}

/**
 * Xuất Excel thống kê phòng đã bán — đọc template giữ nguyên định dạng.
 * Hỗ trợ khoảng thời gian nhiều năm: mỗi năm = 1 khối template copy xuống, cách 2 dòng.
 *
 * Dữ liệu API: [{ nam, thang, ngay, so_phong_da_ban, ti_le_full }, ...]
 */
export const exportThongKePhongDaBan = async (rawData, thangBD, namBD, thangKT, namKT) => {
  // ── Normalize data ───────────────────────────────────────────────────────────
  let data = rawData
  if (rawData && !Array.isArray(rawData)) {
    data = rawData.result ?? rawData.data ?? rawData.content ?? Object.values(rawData)[0] ?? []
  }
  if (!Array.isArray(data)) {
    console.error('exportThongKePhongDaBan: data không phải array', rawData)
    throw new Error('Dữ liệu trả về không đúng định dạng.')
  }

  // ── Nhóm dữ liệu theo nam-thang ─────────────────────────────────────────────
  // grouped[nam][thang][ngay] = so_phong_da_ban
  const grouped = {}
  data.forEach((item) => {
    if (!grouped[item.nam]) grouped[item.nam] = {}
    if (!grouped[item.nam][item.thang]) grouped[item.nam][item.thang] = {}
    grouped[item.nam][item.thang][item.ngay] = item.so_phong_da_ban
  })

  // ── Danh sách năm cần xuất ───────────────────────────────────────────────────
  const namBDNum = parseInt(namBD, 10)
  const namKTNum = parseInt(namKT, 10)
  const years = []
  for (let y = namBDNum; y <= namKTNum; y++) years.push(y)

  // ── Tải template ────────────────────────────────────────────────────────────
  const templateUrl = `${window.location.origin}/templates/template-export-excel-thong-ke-phong-da-ban.xlsx`
  const templateRes = await fetch(templateUrl)
  if (!templateRes.ok) throw new Error('Không tải được file template Excel.')
  const templateBuffer = await templateRes.arrayBuffer()

  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(templateBuffer)
  const ws = wb.worksheets[0]

  // ── Copy thêm khối template cho năm thứ 2 trở đi ────────────────────────────
  // Khối năm đầu: row 1-26 (đã có sẵn trong template)
  // Khối năm 2  : row 29-54 (cách 2 dòng = row 27-28 trống)
  // Khối năm N  : row (29 + (N-2)*28) .. (54 + (N-2)*28)
  const BLOCK_SIZE = TEMPLATE_ROWS                    // 26
  const BLOCK_STEP = BLOCK_SIZE + GAP_ROWS            // 28

  for (let i = 1; i < years.length; i++) {
    const dstStart = TEMPLATE_TITLE_ROW + i * BLOCK_STEP
    copyTemplateBlock(ws, TEMPLATE_TITLE_ROW, TEMPLATE_ROWS, dstStart)
  }

  // ── Điền dữ liệu vào từng khối năm ──────────────────────────────────────────
  years.forEach((nam, i) => {
    const blockTitleRow = TEMPLATE_TITLE_ROW + i * BLOCK_STEP
    const blockDataStart = blockTitleRow + 2  // row 3 trong khối = title + header

    // Cập nhật tiêu đề của khối này
    const thangBDNam = nam === namBDNum ? parseInt(thangBD, 10) : 1
    const thangKTNam = nam === namKTNum ? parseInt(thangKT, 10) : 12
    const titleCell = ws.getCell(blockTitleRow, 1)
    titleCell.value = `BẢNG THEO DÕI TỈ LỆ PHÒNG ĐÃ BÁN\n(Từ tháng ${thangBDNam}/${nam} đến tháng ${thangKTNam}/${nam})`

    // Điền so_phong_da_ban vào hàng lẻ của khối (tháng 1-12)
    // Row 3 của khối = blockDataStart, tháng T = blockDataStart + (T-1)*2
    for (let thang = 1; thang <= 12; thang++) {
      const rowNum = blockDataStart + (thang - 1) * 2
      const dayMap = (grouped[nam] && grouped[nam][thang]) ? grouped[nam][thang] : {}

      for (let ngay = 1; ngay <= 31; ngay++) {
        const colNum = COL_NGAY_START - 1 + ngay  // col 4=Ngày1 .. col 34=Ngày31
        const cell = ws.getRow(rowNum).getCell(colNum)
        const val = dayMap[ngay]
        cell.value = val !== undefined ? val : null
      }
    }
  })

  // ── Ghi ra buffer và tải về ──────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url

  const now = new Date()
  const ts =
    `${now.getFullYear()}` +
    `${String(now.getMonth() + 1).padStart(2, '0')}` +
    `${String(now.getDate()).padStart(2, '0')}` +
    `${String(now.getHours()).padStart(2, '0')}` +
    `${String(now.getMinutes()).padStart(2, '0')}` +
    `${String(now.getSeconds()).padStart(2, '0')}`

  link.setAttribute('download', `ThongKePhongDaBan_${ts}.xlsx`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
