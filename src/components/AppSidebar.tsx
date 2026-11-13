/**
 * AppSidebar Component
 *
 * Collapsible navigation sidebar with branding, menu items, and toggle controls.
 *
 * Features:
 * - Redux-controlled visibility state
 * - Unfoldable/narrow mode for more screen space
 * - Brand logo with full and narrow variants
 * - Close button for mobile devices
 * - Footer with toggle button
 * - Dark color scheme
 * - Fixed positioning
 *
 * @component
 * @example
 * return (
 *   <AppSidebar />
 * )
 */

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
  CNavTitle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

import { logo } from '../assets/brand/logo'
import { sygnet } from '../assets/brand/sygnet'
import type { RootState } from '../store'
import { authStorage } from '../services/authStorage'

// sidebar nav config
import navigation from '../_nav'

/**
 * Filter navigation items based on current user roles & permissions
 */
const getFilteredNav = () => {
  const isAllowed = (item: any): boolean => {
    if (item.roles && !item.roles.some((r: string) => authStorage.hasRole(r))) {
      return false
    }
    if (item.permission && !authStorage.hasPermission(item.permission)) {
      return false
    }
    if (item.permissions && !authStorage.hasAnyPermission(item.permissions)) {
      return false
    }
    return true
  }

  const result: any[] = []
  for (let i = 0; i < navigation.length; i++) {
    const item = navigation[i]
    if (item.component === CNavTitle) {
      result.push(item)
      continue
    }

    if (!isAllowed(item)) continue

    if (item.items) {
      const filteredChildren = item.items.filter(isAllowed)
      if (filteredChildren.length > 0) {
        result.push({ ...item, items: filteredChildren })
      }
    } else {
      result.push(item)
    }
  }

  // Remove trailing or empty consecutive CNavTitles
  const cleaned: any[] = []
  for (let i = 0; i < result.length; i++) {
    const current = result[i]
    if (current.component === CNavTitle) {
      // Find if there is any non-title item between this title and the next title (or end of array)
      const nextTitleIndex = result.findIndex(
        (it, idx) => idx > i && it.component === CNavTitle
      )
      const sliceEnd = nextTitleIndex === -1 ? result.length : nextTitleIndex
      const hasContentAfter = result.slice(i + 1, sliceEnd).some(
        (it) => it.component !== CNavTitle
      )
      if (hasContentAfter) {
        cleaned.push(current)
      }
    } else {
      cleaned.push(current)
    }
  }

  return cleaned
}

/**
 * AppSidebar functional component
 *
 * Manages sidebar state with Redux:
 * - sidebarShow: Controls sidebar visibility
 * - sidebarUnfoldable: Controls narrow/wide mode
 *
 * Renders navigation from _nav.js configuration file.
 * Memoized to prevent unnecessary re-renders.
 *
 * @returns {React.ReactElement} Sidebar with navigation
 */
const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state: RootState) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state: RootState) => state.sidebarShow)
  const filteredNav = React.useMemo(() => getFilteredNav(), [sidebarShow])

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand href="#/dashboard">
          <CIcon customClassName="sidebar-brand-full" icon={logo} height={48} />
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={filteredNav} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
