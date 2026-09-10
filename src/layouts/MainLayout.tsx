import { useState } from 'react'
import { Box } from '@mui/material'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'
import { Outlet } from 'react-router-dom'

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, ml: { md: '264px' } }}>
        <Header onMenuClick={() => setMobileOpen(true)} />
        <Box sx={{ width: '100%', maxWidth: 1440, mx: 'auto', p: { xs: 2, sm: 3, lg: 5 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
