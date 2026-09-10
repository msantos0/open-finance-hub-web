import {
  AccountBalanceWalletOutlined,
  CategoryOutlined,
  Close,
  DashboardOutlined,
  ReceiptLongOutlined,
} from '@mui/icons-material'
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { NavLink } from 'react-router-dom'

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

const menuItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardOutlined /> },
  { label: 'Accounts', path: '/accounts', icon: <AccountBalanceWalletOutlined /> },
  { label: 'Categories', path: '/categories', icon: <CategoryOutlined /> },
  { label: 'Transactions', path: '/transactions', icon: <ReceiptLongOutlined /> },
]

function SidebarContent({ onClose }: { onClose: () => void }) {
  return (
    <Stack sx={{ height: '100%' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3, py: 3 }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Box sx={{ display: 'grid', placeItems: 'center', width: 36, height: 36, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
            <AccountBalanceWalletOutlined fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.04em' }}>Open Finance</Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ display: { md: 'none' } }} aria-label="Close menu">
          <Close />
        </IconButton>
      </Stack>
      <Divider />
      <Box component="nav" sx={{ px: 1.5, py: 2 }}>
        <Typography variant="overline" sx={{ px: 1.5, color: 'text.secondary', fontWeight: 700 }}>Workspace</Typography>
        <List sx={{ mt: 1 }}>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={onClose}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                color: 'text.secondary',
                '&.active': { bgcolor: 'primary.50', color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
            </ListItemButton>
          ))}
        </List>
      </Box>
      <Box sx={{ mt: 'auto', p: 3 }}>
        <Typography variant="caption" color="text.secondary">Personal finance workspace</Typography>
      </Box>
    </Stack>
  )
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      <Drawer variant="permanent" open sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: 264, boxSizing: 'border-box', borderRight: '1px solid', borderColor: 'divider' } }}>
        <SidebarContent onClose={onClose} />
      </Drawer>
      <Drawer variant="temporary" open={mobileOpen} onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box' } }}>
        <SidebarContent onClose={onClose} />
      </Drawer>
    </>
  )
}
