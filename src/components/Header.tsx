import { Menu, NotificationsNone, Search } from '@mui/icons-material'
import { AppBar, Avatar, Box, IconButton, Stack, Toolbar, Typography } from '@mui/material'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ minHeight: { xs: 68, md: 76 }, gap: 2 }}>
        <IconButton onClick={onMenuClick} sx={{ display: { md: 'none' } }} aria-label="Open menu">
          <Menu />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 800 }}>Dashboard</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>Your financial overview</Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton aria-label="Search"><Search /></IconButton>
          <IconButton aria-label="Notifications"><NotificationsNone /></IconButton>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', fontSize: 14, fontWeight: 700 }}>MF</Avatar>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
