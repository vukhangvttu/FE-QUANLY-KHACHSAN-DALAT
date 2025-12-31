import React from 'react'
import { Translation } from 'react-i18next'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))

// Base
const Accordion = React.lazy(() => import('./views/base/accordion/Accordion'))
const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'))
const Cards = React.lazy(() => import('./views/base/cards/Cards'))
const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'))
const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'))
const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'))
const Navs = React.lazy(() => import('./views/base/navs/Navs'))
const Paginations = React.lazy(() => import('./views/base/paginations/Paginations'))
const Placeholders = React.lazy(() => import('./views/base/placeholders/Placeholders'))
const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'))
const Progress = React.lazy(() => import('./views/base/progress/Progress'))
const Spinners = React.lazy(() => import('./views/base/spinners/Spinners'))
const Tables = React.lazy(() => import('./views/base/tables/Tables'))
const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'))

// Buttons
const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'))
const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'))
const LoadingButtons = React.lazy(() => import('./views/buttons/loading-buttons/LoadingButtons'))
const Dropdowns = React.lazy(() => import('./views/buttons/dropdowns/Dropdowns'))

//Forms
const ChecksRadios = React.lazy(() => import('./views/forms/checks-radios/ChecksRadios'))
const DatePicker = React.lazy(() => import('./views/forms/date-picker/DatePicker'))
const DateRangePicker = React.lazy(() => import('./views/forms/date-range-picker/DateRangePicker'))
const FloatingLabels = React.lazy(() => import('./views/forms/floating-labels/FloatingLabels'))
const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))
const InputGroup = React.lazy(() => import('./views/forms/input-group/InputGroup'))
const Layout = React.lazy(() => import('./views/forms/layout/Layout'))
const MultiSelect = React.lazy(() => import('./views/forms/multi-select/MultiSelect'))
const Range = React.lazy(() => import('./views/forms/range/Range'))
const Select = React.lazy(() => import('./views/forms/select/Select'))
const TimePicker = React.lazy(() => import('./views/forms/time-picker/TimePicker'))
const Validation = React.lazy(() => import('./views/forms/validation/Validation'))

// Icons
const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'))
const Flags = React.lazy(() => import('./views/icons/flags/Flags'))
const Brands = React.lazy(() => import('./views/icons/brands/Brands'))

// Notifications
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))
const Modals = React.lazy(() => import('./views/notifications/modals/Modals'))
const Toasts = React.lazy(() => import('./views/notifications/toasts/Toasts'))

const SmartTable = React.lazy(() => import('./views/smart-table/SmartTable'))

// Plugins
const Calendar = React.lazy(() => import('./views/plugins/calendar/Calendar'))
const Charts = React.lazy(() => import('./views/plugins/charts/Charts'))
const GoogleMaps = React.lazy(() => import('./views/plugins/google-maps/GoogleMaps'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const Invoice = React.lazy(() => import('./views/apps/invoicing/Invoice'))

// hangphong&phong
// 1 view
const ViewHangPhong_Phong = React.lazy(() => import('./view/hangphong_phong/View'))

// đặt phòng
const AddDatPhong = React.lazy(() => import('./view/booking/AddDatPhong'))
const ThemDatPhong = React.lazy(() => import('./view/booking/AddBooKing'))
const DanhSachDatPhong = React.lazy(() => import('./view/booking/DanhSachBooKing'))
const EditBooKing = React.lazy(() => import('./view/booking/EditBooKing'))
// chatroom
const ViewChatRoom = React.lazy(() => import('./view/chatroom/View'))

// xếp phòng
const AddXepPhong = React.lazy(() => import('./view/xepphongbooking/AddXepPhong'))
const EditXepPhong = React.lazy(() => import('./view/xepphongbooking/EditXepPhong'))

// thêm khách vào phòng
const AddGuestToRoom = React.lazy(() => import('./view/AddGuestListToRoom/AddGuestToRoom'))

// dịch vụ
const DichVu = React.lazy(() => import('./view/dichvu/DichVu'))

// thanh toán
const ThanhToan = React.lazy(() => import('./view/ThanhToan/ThanhToan'))
const AllThanhToan = React.lazy(() => import('./view/ThanhToan/AllThanhToan'))
const XemThanhToan = React.lazy(() => import('./view/ThanhToan/XemThanhToan'))

// xem thống kê
const XemThongKe = React.lazy(() => import('./view/thongke/ThongKe'))
const XemThongKeBuongPhong = React.lazy(() => import('./view/thongke/ThongKeBuongPhong'))

// xuất report
const XuatReport = React.lazy(() => import('./view/pdf/XuatPhieuDangKy'))
const XuatPhieuDangKyPhong = React.lazy(() => import('./view/pdf/XuatPhieuDangKyPhong'))

// xuất report OTA_TA ALL
const XuatReportOTA_TA_ALL = React.lazy(() => import('./view/pdf/XuatPhieuDangKy_TA_OTA'))
// xuất report OTA_TA Phòng
const XuatReportOTA_TA_PHONG = React.lazy(() => import('./view/pdf/XuatPhieuDangKyPhong_TA_OTA'))

// xuất report chi tiết đặt phòng
const XuatReportChiTietDatPhong = React.lazy(() => import('./view/pdf/XuatPhieuChiTietDatPhong'))

// xem check-in
const Check_InPhong = React.lazy(() => import('./view/check-in/Check_InPhong'))

// hóa đơn vat
const HoaDonVAT = React.lazy(() => import('./view/HoaDon/HoaDonVAT'))

// PDF Chi Tiết Đặt Phong
const ChiTietDatPhong = React.lazy(() => import('./view/pdf/XuatPhieuChiTietDatPhong'))

// PDF phiếu thanh toán
const XuatPhieuThanhToan = React.lazy(() => import('./view/pdf/XuatPhieuThanhToan'))

const routes = [
  { path: '/', exact: true },

  {
    path: '/dashboard',
    name: <Translation>{(t) => t('Khách sạn')}</Translation>,
    element: ViewChatRoom,
  },
  {
    path: '/hangphong-phong',
    name: <Translation>{(t) => t('Hạng phòng & phòng')}</Translation>,
    element: ViewHangPhong_Phong,
    exact: true,
  },
  {
    path: '/dashboard/pos/add-chi-tiet-dat-phong',
    name: 'Đặt phòng',
    element: AddDatPhong,
    exact: true,
  },
  {
    path: '/dashboard/pos/danh-sach-booking/add-booking',
    name: 'Add đặt phòng',
    element: ThemDatPhong,
    exact: true,
  },
  {
    path: '/dashboard/pos/danh-sach-booking/edit-booking/:ma_booking',
    name: <Translation>{(t) => t('Edit đặt phòng')}</Translation>,
    element: EditBooKing,
    exact: true,
  },
  {
    path: '/dashboard/pos/danh-sach-booking',
    name: 'Danh sách đặt phòng',
    element: DanhSachDatPhong,
  },
  {
    path: '/dashboard/pos/danh-sach-booking/add-xep-phong/:ma_booking',
    name: 'Add xếp phòng',
    element: AddXepPhong,
  },
  {
    path: '/dashboard/pos/danh-sach-booking/edit-xep-phong/:ma_booking',
    name: 'Edit xếp phòng',
    element: EditXepPhong,
  },
  {
    path: '/dashboard/pos/danh-sach-booking/edit-xep-phong/:ma_booking',
    name: 'Edit xếp phòng',
    element: EditXepPhong,
  },
  {
    path: '/dashboard/pos/danh-sach-booking/pdf-chi-tiet-dat-phong/:ma_booking',
    name: 'PDF',
    element: ChiTietDatPhong,
  },
  {
    path: '/dashboard/pos/add-guest-to-room/:tenPhong/:ma_xepphong_booking',
    name: 'Add khách vào phòng',
    element: AddGuestToRoom,
  },
  {
    path: '/dashboard/pos/check-in/:maphong/:ma_booking/:ma_xepphong_booking',
    name: 'Check-in phòng',
    element: Check_InPhong,
  },
  {
    path: '/dashboard/pos/dich-vu/:ma_phong/:ma_booking/:ma_xepphong_booking',
    name: 'Dịch vụ',
    element: DichVu,
  },
  {
    path: '/dashboard/pos/thanh-toan/:ma_booking/:ma_xepphong_booking',
    name: 'Thanh toán',
    element: ThanhToan,
  },
  {
    path: '/dashboard/pos/danh-sach-booking/all-thanh-toan/:ma_booking',
    name: 'Tất cả thanh toán',
    element: AllThanhToan,
  },
  {
    path: '/dashboard/pos/danh-sach-booking/xem-thanh-toan/:ma_booking',
    name: 'Xem thanh toán',
    element: XemThanhToan,
  },
  {
    path: '/dashboard/pos/thong-ke',
    name: 'Thống kê',
    element: XemThongKe,
  },
  {
    path: '/dashboard/pos/thong-ke-buon-phong',
    name: 'Thống kê buồng phòng',
    element: XemThongKeBuongPhong,
  },
  {
    path: '/dashboard/pos/danh-sach-booking/xuat-thong-tin-phieu-dang-ky/:ma_booking',
    name: 'Xuất phiếu đăng ký khách sạn',
    element: XuatReport,
  },
  {
    path: '/dashboard/pos/danh-sach-booking/xuat-thong-tin-phieu-dang-ky-ota-ta/:ma_booking',
    name: 'Xuất phiếu đăng ký khách sạn OTA_TA',
    element: XuatReportOTA_TA_ALL,
  },
  {
    path: '/dashboard/pos/danh-sach-booking/xuat-chi-tiet-dat-phong/:ma_booking',
    name: 'Xuất phiếu chi tiết đặt phòng',
    element: XuatReportChiTietDatPhong,
  },

  {
    path: '/dashboard/pos/xuat-thong-tin-phieu-dang-ky/:ma_xepphong',
    name: 'Xuất phiếu đăng ký khách sạn',
    element: XuatPhieuDangKyPhong,
  },
  {
    path: '/dashboard/pos/xuat-thong-tin-phieu-dang-ky-ota-ta/:ma_xepphong',
    name: 'Xuất phiếu đăng ký khách sạn OTA_TA',
    element: XuatReportOTA_TA_PHONG,
  },
  {
    path: '/dashboard/pos/danh-sach-booking/xuat-phieu-thanh-toan/:ma_booking',
    name: 'Xuất phiếu thanh toán',
    element: XuatPhieuThanhToan,
  },
  {
    path: '/dashboard/pos/danh-sach-booking/xem-thanh-toan/:ma_booking/hoa-don-vat',
    name: 'Hóa đơn VAT',
    element: HoaDonVAT,
  },
  {
    path: '/theme',
    name: <Translation>{(t) => t('theme')}</Translation>,
    element: Colors,
    exact: true,
  },
  { path: '/theme/colors', name: <Translation>{(t) => t('colors')}</Translation>, element: Colors },
  {
    path: '/theme/typography',
    name: <Translation>{(t) => t('typography')}</Translation>,
    element: Typography,
  },
  {
    path: '/base',
    name: <Translation>{(t) => t('base')}</Translation>,
    element: Cards,
    exact: true,
  },
  { path: '/base/accordion', name: 'Accordion', element: Accordion },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', element: Breadcrumbs },
  { path: '/base/cards', name: 'Cards', element: Cards },
  { path: '/base/carousels', name: 'Carousel', element: Carousels },
  { path: '/base/collapses', name: 'Collapse', element: Collapses },
  { path: '/base/list-groups', name: 'List Groups', element: ListGroups },
  { path: '/base/navs', name: 'Navs', element: Navs },
  { path: '/base/paginations', name: 'Paginations', element: Paginations },
  { path: '/base/placeholders', name: 'Placeholders', element: Placeholders },
  { path: '/base/popovers', name: 'Popovers', element: Popovers },
  { path: '/base/progress', name: 'Progress', element: Progress },
  { path: '/base/spinners', name: 'Spinners', element: Spinners },
  { path: '/base/tables', name: 'Tables', element: Tables },
  { path: '/base/tooltips', name: 'Tooltips', element: Tooltips },
  {
    path: '/buttons',
    name: <Translation>{(t) => t('buttons')}</Translation>,
    element: Buttons,
    exact: true,
  },
  { path: '/buttons/buttons', name: 'Buttons', element: Buttons },
  { path: '/buttons/button-groups', name: 'Button Groups', element: ButtonGroups },
  { path: '/buttons/loading-buttons', name: 'Loading Buttons', element: LoadingButtons },
  { path: '/buttons/dropdowns', name: 'Dropdowns', element: Dropdowns },
  {
    path: '/forms',
    name: <Translation>{(t) => t('forms')}</Translation>,
    element: FormControl,
    exact: true,
  },
  { path: '/forms/form-control', name: 'Form Control', element: FormControl },
  { path: '/forms/select', name: 'Select', element: Select },
  { path: '/forms/multi-select', name: 'Multi Select', element: MultiSelect },
  { path: '/forms/checks-radios', name: 'Checks & Radios', element: ChecksRadios },
  { path: '/forms/range', name: 'Range', element: Range },
  { path: '/forms/input-group', name: 'Input Group', element: InputGroup },
  { path: '/forms/floating-labels', name: 'Floating Labels', element: FloatingLabels },
  { path: '/forms/date-picker', name: 'Date Picker', element: DatePicker },
  { path: '/forms/date-range-picker', name: 'Date Range Picker', element: DateRangePicker },
  { path: '/forms/time-picker', name: 'Time Picker', element: TimePicker },
  { path: '/forms/layout', name: 'Layout', element: Layout },
  { path: '/forms/validation', name: 'Validation', element: Validation },
  {
    path: '/icons',
    exact: true,
    name: <Translation>{(t) => t('icons')}</Translation>,
    element: CoreUIIcons,
  },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', element: CoreUIIcons },
  { path: '/icons/flags', name: 'Flags', element: Flags },
  { path: '/icons/brands', name: 'Brands', element: Brands },
  {
    path: '/notifications',
    name: <Translation>{(t) => t('notifications')}</Translation>,
    element: Alerts,
    exact: true,
  },
  { path: '/notifications/alerts', name: 'Alerts', element: Alerts },
  { path: '/notifications/badges', name: 'Badges', element: Badges },
  { path: '/notifications/modals', name: 'Modals', element: Modals },
  { path: '/notifications/toasts', name: 'Toasts', element: Toasts },
  {
    path: '/plugins',
    name: <Translation>{(t) => t('plugins')}</Translation>,
    element: Calendar,
    exact: true,
  },
  {
    path: '/plugins/calendar',
    name: <Translation>{(t) => t('calendar')}</Translation>,
    element: Calendar,
  },
  {
    path: '/plugins/charts',
    name: <Translation>{(t) => t('charts')}</Translation>,
    element: Charts,
  },
  { path: '/plugins/google-maps', name: 'GoogleMaps', element: GoogleMaps },
  { path: '/smart-table', name: 'Smart Table', element: SmartTable },
  { path: '/widgets', name: <Translation>{(t) => t('widgets')}</Translation>, element: Widgets },
  {
    path: '/apps',
    name: <Translation>{(t) => t('apps')}</Translation>,
    element: Invoice,
    exact: true,
  },
  { path: '/apps/invoicing', name: 'Invoice', element: Invoice, exact: true },
  { path: '/apps/invoicing/invoice', name: 'Invoice', element: Invoice },
  { path: '/apps/email', name: 'Email', exact: true },
  { path: '/apps/email/inbox', name: 'Inbox', exact: true },
  { path: '/apps/email/compose', name: 'Compose', exact: true },
  { path: '/apps/email/message', name: 'Message', exact: true },
]

export default routes
