import React from 'react'
import { CCard, CCardBody } from '@coreui/react'
import { useNotifications } from './hooks/useNotifications'
import { NotificationHeader } from './components/NotificationHeader'
import { NotificationStats } from './components/NotificationStats'
import { NotificationTabs } from './components/NotificationTabs'
import { NotificationFilters } from './components/NotificationFilters'
import { NotificationList } from './components/NotificationList'
import { NotificationPagination } from './components/NotificationPagination'
import './NotificationPage.css'

const NotificationPage: React.FC = () => {
  const {
    tab,
    filteredItems,
    total,
    page,
    pageSize,
    loading,
    unread,
    totalUnreadAll,
    search,
    statusFilter,
    typeFilter,
    soundOn,
    actionLoading,
    totalPages,
    startItemIndex,
    endItemIndex,
    hasActiveFilters,
    setSearch,
    setStatusFilter,
    setTypeFilter,
    setPage,
    setPageSize,
    handleTabChange,
    handleItemClick,
    handleMarkSingle,
    handleMarkAll,
    toggleSound,
    clearFilters,
    reload,
  } = useNotifications()

  return (
    <div className="notification-center pb-5">
      {/* 1. Page Header & Global Actions */}
      <NotificationHeader
        totalUnreadAll={totalUnreadAll}
        soundOn={soundOn}
        loading={loading}
        actionLoading={actionLoading}
        currentTabUnread={unread[tab]}
        onToggleSound={toggleSound}
        onReload={reload}
        onMarkAll={() => void handleMarkAll()}
      />

      {/* 2. Metric & Status Cards */}
      <NotificationStats
        totalUnreadAll={totalUnreadAll}
        unread={unread}
        total={total}
        tab={tab}
      />

      {/* 3. Main Center Card with Tabs, Filters, List, and Pagination */}
      <CCard className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        {/* Navigation Tabs */}
        <NotificationTabs
          tab={tab}
          unread={unread}
          total={total}
          startItemIndex={startItemIndex}
          endItemIndex={endItemIndex}
          onTabChange={handleTabChange}
        />

        {/* Toolbar & Filters */}
        <NotificationFilters
          search={search}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          pageSize={pageSize}
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
          onTypeFilterChange={setTypeFilter}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
        />

        {/* Notification List Content */}
        <CCardBody className="p-3">
          <NotificationList
            loading={loading}
            items={filteredItems}
            tab={tab}
            hasActiveFilters={hasActiveFilters}
            actionLoading={actionLoading}
            onClearFilters={clearFilters}
            onItemClick={(item) => void handleItemClick(item)}
            onMarkSingle={(e, item) => void handleMarkSingle(e, item)}
          />

          {/* Pagination Controls */}
          {!loading && (
            <NotificationPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </CCardBody>
      </CCard>
    </div>
  )
}

export default NotificationPage
