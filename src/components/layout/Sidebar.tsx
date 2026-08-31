import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuthStore } from '@/store/auth.store';

export const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  roles?: string[];
  children?: Omit<NavItem, 'children'>[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  {
    label: 'Admins',
    path: '/admins',
    icon: <AdminPanelSettingsIcon />,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Categories',
    icon: <CategoryIcon />,
    children: [
      { label: 'All Categories', path: '/categories', icon: <CategoryIcon fontSize="small" /> },
    ],
  },
  { label: 'Profiles', path: '/profiles', icon: <PersonIcon /> },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function NavItems() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState<Record<string, boolean>>({ Categories: true });

  const isActive = (path?: string) =>
    path ? location.pathname === path || location.pathname.startsWith(path + '/') : false;

  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user?.role ?? ''));

  return (
    <List disablePadding>
      {items.map((item) => {
        if (item.children) {
          const expanded = open[item.label] ?? false;
          return (
            <Box key={item.label}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => setOpen((p) => ({ ...p, [item.label]: !p[item.label] }))}>
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
              </ListItem>
              <Collapse in={expanded} unmountOnExit>
                <List disablePadding>
                  {item.children.map((child) => (
                    <ListItem key={child.path} disablePadding>
                      <ListItemButton
                        component={Link}
                        to={child.path!}
                        selected={isActive(child.path)}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          );
        }
        return (
          <ListItem key={item.path} disablePadding>
            <Tooltip title={item.label} placement="right" disableHoverListener>
              <ListItemButton component={Link} to={item.path!} selected={isActive(item.path)}>
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        );
      })}
    </List>
  );
}

const drawerContent = (
  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
      <PeopleIcon color="primary" />
      <Typography variant="h6" fontWeight={700} color="primary.main">
        Admin Panel
      </Typography>
    </Box>
    <Divider />
    <Box sx={{ flex: 1, overflow: 'auto', pt: 1 }}>
      <NavItems />
    </Box>
  </Box>
);

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export default Sidebar;
