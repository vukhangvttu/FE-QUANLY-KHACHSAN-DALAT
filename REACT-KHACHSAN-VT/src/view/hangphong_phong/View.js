import { CButton, CTable } from '@coreui/react-pro';
import React, { useState } from 'react';


const View = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const columns = [
    {
      key: 'id',
      label: 'Mã hạng phòng',
      _props: { scope: 'col' },
    },
    {
      key: 'class',
      label: 'Tên hạng phòng',
      _props: { scope: 'col' },
    },
    {
      key: 'heading_1',
      label: 'SL phòng',
      _props: { scope: 'col' },
    },
    {
      key: 'heading_2',
      label: 'Giá giờ',
      _props: { scope: 'col' },
    },
    {
        key: 'heading_2',
        label: 'Giá cả ngày',
        _props: { scope: 'col' },
      },
      {
        key: 'heading_2',
        label: 'Giá qua đêm',
        _props: { scope: 'col' },
      },
      {
        key: 'heading_2',
        label: 'Trạng thái',
        _props: { scope: 'col' },
      },
  ]
  const items = [
    {
      id: 1,
      class: 'Mark',
      heading_1: 'Otto',
      heading_2: '@mdo',
      _cellProps: { id: { scope: 'row' } },
    },
    {
      id: 2,
      class: 'Jacob',
      heading_1: 'Thornton',
      heading_2: '@fat',
      _cellProps: { id: { scope: 'row' } },
    },
    {
      id: 3,
      class: 'Larry the Bird',
      heading_2: '@twitter',
      _cellProps: { id: { scope: 'row' }, class: { colSpan: 2 } },
    },
  ]

  return (
    <div>
        <div>
        <CButton color="success"> Thêm mới</CButton>
        </div>
      <div className=" border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px font-medium text-center" id="default-tab" role="tablist">
          <li className="mr-2" role="presentation">
            <button
              className={`inline-block p-3 border-b-2 rounded-t-lg ${activeTab === 'profile' ? 'border-blue-500 text-blue-500' : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`}
              id="profile-tab"
              type="button"
              role="tab"
              aria-controls="profile"
              aria-selected={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
            >
               Hạng phòng
            </button>
          </li>
          <li className="mr-2" role="presentation">
            <button
              className={`inline-block p-3 border-b-2 rounded-t-lg ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-500' : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`}
              id="dashboard-tab"
              type="button"
              role="tab"
              aria-controls="dashboard"
              aria-selected={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
            >
             Danh sách phòng
            </button>
          </li>
        
        </ul>
      </div>
      <div id="default-tab-content">
        <div className={`${activeTab === 'profile' ? 'block' : 'hidden'} `} id="profile" role="tabpanel" aria-labelledby="profile-tab">
        <CTable columns={columns} items={items} />
        </div>
        <div className={`${activeTab === 'dashboard' ? 'block' : 'hidden'} p-4 bg-gray-50 dark:bg-gray-800`} id="dashboard" role="tabpanel" aria-labelledby="dashboard-tab">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This is some placeholder content the <strong className="font-medium text-gray-800 dark:text-white">Dashboard tabs associated content</strong>. Clicking another tab will toggle the visibility of this one for the next. The tab JavaScript swaps classes to control the content visibility and styling.
          </p>
        </div>
      </div>
    </div>
  );
};

export default View;