
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from 'src/components/container/PageContainer';

import { Grid } from "@mui/material";
import SimpleLineChart from '@/dev/examples/components/muicharts/linescharts/linechart/SimpleLineChart';
import TinyLineChart from '@/dev/examples/components/muicharts/linescharts/linechart/TinyLineChart';
import DashedLineChart from '@/dev/examples/components/muicharts/linescharts/linechart/DashedLineChart';
import BiaxialLineChart from '@/dev/examples/components/muicharts/linescharts/linechart/BiaxialLineChart';
import LineChartWithReferenceLines from '@/dev/examples/components/muicharts/linescharts/linechart/LineChartWithReferenceLinesChart';
import LinewithforecastChart from '@/dev/examples/components/muicharts/linescharts/linechart/LinewithforecastChart';

const BCrumb = [
    {
        to: "/",
        title: "Home",
    },
    {
        title: "Mui Line Charts",
    },
];

const LineChart = () => {
    return (
        <PageContainer title="Mui Line Chart" description="this is Mui Line Chart">
            <Breadcrumb title="Mui Line  Chart" items={BCrumb} />
            <Grid container spacing={3}>

                <SimpleLineChart />


                <TinyLineChart />


                <DashedLineChart />


                <BiaxialLineChart />


                <LineChartWithReferenceLines />


                <LinewithforecastChart />


            </Grid>
        </PageContainer>
    );
};

export default LineChart;
