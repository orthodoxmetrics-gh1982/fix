import { Avatar, Box, Typography, Grid, Stack } from '@mui/material';
import * as dropdownData from './data';
import { Link } from 'react-router';
import { useMenuVisibility } from '../../../../contexts/MenuVisibilityContext';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';

const AppLinks = () => {
  const { visibleMenus } = useMenuVisibility();

  // Map dropdown app hrefs to menu IDs
  const appIdMap: { [href: string]: string } = {
    '/apps/notes': 'app-notes',
    '/apps/liturgical-calendar': 'app-calendar',
    '/apps/email': 'app-email',
    '/apps/kanban': 'app-kanban',
    '/apps/ocr-upload': 'app-ocr-upload',
    '/apps/invoice/list': 'app-invoice',
  };

  // Filter visible apps
  const visibleApps = dropdownData.appsLink.filter(app => {
    const menuId = appIdMap[app.href];
    return menuId ? visibleMenus[menuId] : true; // Show by default if not mapped
  });

  return (
    (<Grid container spacing={3} mb={4}>
      {visibleApps.map((links, index) => (
        <Grid
          key={index}
          size={{
            lg: 6
          }}>
          <Link to={links.href} className="hover-text-primary">
            <Stack direction="row" spacing={2}>
              <Box
                minWidth="45px"
                height="45px"
                bgcolor="grey.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Avatar
                  src={links.avatar}
                  alt={links.avatar}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 0,
                  }}
                />
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="textPrimary"
                  noWrap
                  className="text-hover"
                  sx={{
                    width: '240px',
                  }}
                >
                  {links.title}
                </Typography>
                <Typography
                  color="textSecondary"
                  variant="subtitle2"
                  fontSize="12px"
                  sx={{
                    width: '240px',
                  }}
                  noWrap
                >
                  {links.subtext}
                </Typography>
              </Box>
            </Stack>
          </Link>
        </Grid>
      ))}
    </Grid>)
  );
};

export default AppLinks;
