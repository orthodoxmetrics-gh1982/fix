import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Alert,
    Card,
    CardContent,
    Tab,
    Tabs,
    Stack,
    Button,
    CircularProgress,
    Chip,
    LinearProgress,
    Divider
} from '@mui/material';
import {
    IconSettings,
    IconDatabase,
    IconShield,
    IconMail,
    IconServer,
    IconCpu,
    IconDeviceDesktop,
    IconClock,
    IconDatabaseExport,
    IconUsers,
    IconVersions,
    IconWorld,
    IconCalendar
} from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import BackupSettings from '../settings/BackupSettings';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import { 
    getSystemInfo, 
    formatMemory, 
    getMemoryUsagePercentage, 
    formatPlatform, 
    formatArchitecture, 
    getEnvironmentDisplayName,
    SystemInfo 
} from '../../services/adminService';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`admin-settings-tabpanel-${index}`}
            aria-labelledby={`admin-settings-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const AdminSettings: React.FC = () => {
    const { isSuperAdmin } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch system information when General tab is active
    useEffect(() => {
        if (tabValue === 0) {
            fetchSystemInfo();
        }
    }, [tabValue]);

    const fetchSystemInfo = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const data = await getSystemInfo();
            setSystemInfo(data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to load system information');
            console.error('Error fetching system info:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const BCrumb = [
        { to: '/', title: 'Home' },
        { to: '/admin', title: 'Admin' },
        { title: 'Settings' },
    ];

    return (
        <PageContainer title="Admin Settings" description="Administrative settings for the Orthodox Metrics system">
            <Breadcrumb title="Admin Settings" items={BCrumb} />
            <Box p={3}>
                <Box display="flex" alignItems="center" mb={3}>
                    <IconSettings size="24" style={{ marginRight: 8 }} />
                    <Typography variant="h4">Admin Settings</Typography>
                </Box>

                <Card>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin settings tabs">
                            <Tab
                                icon={<IconServer />}
                                label="General"
                                id="admin-settings-tab-0"
                                aria-controls="admin-settings-tabpanel-0"
                            />
                            <Tab
                                icon={<IconDatabase />}
                                label="Backup & Restore"
                                id="admin-settings-tab-1"
                                aria-controls="admin-settings-tabpanel-1"
                            />
                            <Tab
                                icon={<IconShield />}
                                label="Security"
                                id="admin-settings-tab-2"
                                aria-controls="admin-settings-tabpanel-2"
                            />
                            <Tab
                                icon={<IconMail />}
                                label="Notifications"
                                id="admin-settings-tab-3"
                                aria-controls="admin-settings-tabpanel-3"
                            />
                        </Tabs>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                        <Typography variant="h6" gutterBottom>
                            General Settings
                        </Typography>

                        {loading && (
                            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                                <CircularProgress />
                                <Typography variant="body2" sx={{ ml: 2 }}>
                                    Loading system information...
                                </Typography>
                            </Box>
                        )}

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }} action={
                                <Button color="inherit" size="small" onClick={fetchSystemInfo}>
                                    Retry
                                </Button>
                            }>
                                {error}
                            </Alert>
                        )}

                        {!loading && !error && systemInfo && (
                            <Stack spacing={3}>
                                {/* System Information Section */}
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <IconServer size={24} style={{ marginRight: 8, color: '#1976d2' }} />
                                            <Typography variant="h6">
                                                System Information
                                            </Typography>
                                        </Box>
                                        
                                        <Stack spacing={2}>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                                <Box flex={1}>
                                                    <Box display="flex" alignItems="center" mb={1}>
                                                        <IconVersions size={16} style={{ marginRight: 8 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Node.js Version
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {systemInfo.nodeVersion}
                                                    </Typography>
                                                </Box>
                                                <Box flex={1}>
                                                    <Box display="flex" alignItems="center" mb={1}>
                                                        <IconClock size={16} style={{ marginRight: 8 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Server Uptime
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {systemInfo.uptime}
                                                    </Typography>
                                                </Box>
                                                <Box flex={1}>
                                                    <Box display="flex" alignItems="center" mb={1}>
                                                        <IconDeviceDesktop size={16} style={{ marginRight: 8 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Hostname
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {systemInfo.hostname}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                            
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                                <Box flex={1}>
                                                    <Box display="flex" alignItems="center" mb={1}>
                                                        <IconDatabaseExport size={16} style={{ marginRight: 8 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Memory Usage
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {formatMemory(systemInfo.memory)} / {formatMemory(systemInfo.totalMemory)}
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={getMemoryUsagePercentage(systemInfo.memory, systemInfo.totalMemory)}
                                                        sx={{ mt: 1, height: 6, borderRadius: 1 }}
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {getMemoryUsagePercentage(systemInfo.memory, systemInfo.totalMemory)}% used
                                                    </Typography>
                                                </Box>
                                                <Box flex={1}>
                                                    <Box display="flex" alignItems="center" mb={1}>
                                                        <IconDeviceDesktop size={16} style={{ marginRight: 8 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Platform
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {formatPlatform(systemInfo.platform)} ({formatArchitecture(systemInfo.arch)})
                                                    </Typography>
                                                </Box>
                                                <Box flex={1}>
                                                    <Box display="flex" alignItems="center" mb={1}>
                                                        <IconCpu size={16} style={{ marginRight: 8 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            CPU Cores / Load
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {systemInfo.cpuCount} cores / {systemInfo.loadAverage}%
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>

                                {/* Application Settings Section */}
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <IconSettings size={24} style={{ marginRight: 8, color: '#2e7d32' }} />
                                            <Typography variant="h6">
                                                Application Settings
                                            </Typography>
                                        </Box>
                                        
                                        <Stack spacing={2}>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                                <Box flex={1}>
                                                    <Box display="flex" alignItems="center" mb={1}>
                                                        <IconDatabase size={16} style={{ marginRight: 8 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Environment
                                                        </Typography>
                                                    </Box>
                                                    <Chip 
                                                        label={getEnvironmentDisplayName(systemInfo.env)}
                                                        color={systemInfo.env === 'production' ? 'success' : 'warning'}
                                                        size="small"
                                                    />
                                                </Box>
                                                <Box flex={1}>
                                                    <Box display="flex" alignItems="center" mb={1}>
                                                        <IconVersions size={16} style={{ marginRight: 8 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            OrthodoxMetrics Version
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        v{systemInfo.version}
                                                    </Typography>
                                                </Box>
                                                <Box flex={1}>
                                                    <Box display="flex" alignItems="center" mb={1}>
                                                        <IconCalendar size={16} style={{ marginRight: 8 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Date Format
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {systemInfo.dateFormat}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                            
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                                <Box flex={1}>
                                                    <Box display="flex" alignItems="center" mb={1}>
                                                        <IconWorld size={16} style={{ marginRight: 8 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Default Language
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        English ({systemInfo.language.toUpperCase()})
                                                    </Typography>
                                                </Box>
                                                <Box flex={1}>
                                                    <Box display="flex" alignItems="center" mb={1}>
                                                        <IconUsers size={16} style={{ marginRight: 8 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Churches in System
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {systemInfo.churchCount} {systemInfo.churchCount === 1 ? 'church' : 'churches'}
                                                    </Typography>
                                                </Box>
                                                <Box flex={1}>
                                                    <Box display="flex" alignItems="center" mb={1}>
                                                        <IconDatabaseExport size={16} style={{ marginRight: 8 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Free Memory
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {formatMemory(systemInfo.freeMemory)} available
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Stack>

                                        <Divider sx={{ my: 2 }} />

                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body2" color="text.secondary">
                                                Last updated: {new Date().toLocaleString()}
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={fetchSystemInfo}
                                                disabled={loading}
                                            >
                                                Refresh
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Stack>
                        )}
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <BackupSettings />
                    </TabPanel>

                    <TabPanel value={tabValue} index={isSuperAdmin() ? 2 : 1}>
                        <Typography variant="h6" gutterBottom>
                            Security Settings
                        </Typography>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Security settings are under development.
                        </Alert>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                            <Card variant="outlined" sx={{ flex: 1 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Password Policy
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Configure password requirements and policies.
                                    </Typography>
                                </CardContent>
                            </Card>
                            <Card variant="outlined" sx={{ flex: 1 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Session Management
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Configure session timeout and security settings.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Stack>
                    </TabPanel>

                    <TabPanel value={tabValue} index={isSuperAdmin() ? 3 : 2}>
                        <Typography variant="h6" gutterBottom>
                            Notification Settings
                        </Typography>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Notification system is now active. Manage notification types, templates, and user preferences.
                        </Alert>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                            <Card variant="outlined" sx={{ flex: 1 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Email Notifications
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Configure email notification settings and templates.
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <Button variant="outlined" size="small">
                                            Manage Templates
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                            <Card variant="outlined" sx={{ flex: 1 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        System Alerts
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Configure system alerts and monitoring notifications.
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <Button variant="outlined" size="small">
                                            View Queue
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Stack>
                    </TabPanel>
                </Card>
            </Box>
        </PageContainer>
    );
};

export default AdminSettings;
