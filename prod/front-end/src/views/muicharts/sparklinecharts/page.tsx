"use client"
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from 'src/components/container/PageContainer';
import { Grid } from "@mui/material";
import BasicSparkLine from '@/dev/examples/components/muicharts/sparklinecharts/BasicSparkLine';
import AreaSparkLineChart from '@/dev/examples/components/muicharts/sparklinecharts/AreaSparkLineChart';
import BasicSparkLineCustomizationChart from '@/dev/examples/components/muicharts/sparklinecharts/BasicSparkLineCustomizationChart';


const BCrumb = [
    {
        to: "/",
        title: "Home",
    },
    {
        title: "SparkLineCharts ",
    },
];

const SparkLineCharts = () => {
    return (
        <PageContainer title="SparkLineCharts" description="this is SparkLineCharts ">

            <Breadcrumb title="SparkLineCharts" items={BCrumb} />
            <Grid container spacing={3}>
                <BasicSparkLine />
                <AreaSparkLineChart />
                <BasicSparkLineCustomizationChart />
            </Grid>
        </PageContainer>
    );
};

export default SparkLineCharts;
