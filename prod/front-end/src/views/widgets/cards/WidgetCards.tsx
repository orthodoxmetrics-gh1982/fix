// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import { Grid } from '@mui/material';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from 'src/components/container/PageContainer';

import PaymentGateways from '@/src/components/dashboards/ecommerce/PaymentGateways';
import RecentTransactions from '@/src/components/dashboards/ecommerce/RecentTransactions';
import TopCards from '@/src/components/dashboards/modern/TopCards';
import UpcomingAcitivity from '@/src/components/widgets/cards/UpcomingActivity';
import ComplexCard from '@/src/components/widgets/cards/ComplexCard';
import MusicCard from '@/src/components/widgets/cards/MusicCard';
import EcommerceCard from '@/src/components/widgets/cards/EcommerceCard';
import FollowerCard from '@/src/components/widgets/cards/FollowerCard';
import FriendCard from '@/src/components/widgets/cards/FriendCard';
import ProfileCard from '@/src/components/widgets/cards/ProfileCard';

import Settings from '@/src/components/widgets/cards/Settings';
import GiftCard from '@/src/components/widgets/cards/GiftCard';


const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Cards',
  },
];

const WidgetCards = () => {
  return (
    (<PageContainer title="Cards" description="this is Cards page">
      {/* breadcrumb */}
      <Breadcrumb title="Cards" items={BCrumb} />
      {/* end breadcrumb */}
      <Grid container spacing={3}>
        <Grid size={12}>
          <TopCards />
        </Grid>
        <Grid size={12}>
          <ComplexCard />
        </Grid>
        <Grid size={12}>
          <EcommerceCard />
        </Grid>
        <Grid size={12}>
          <MusicCard />
        </Grid>
        <Grid size={12}>
          <FollowerCard />
        </Grid>
        <Grid size={12}>
          <FriendCard />
        </Grid>
        <Grid size={12}>
          <ProfileCard />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4
          }}>
          <Settings />
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 8
          }}>
          <GiftCard />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4
          }}>
          <PaymentGateways />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4
          }}>
          <UpcomingAcitivity />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4
          }}>
          <RecentTransactions />
        </Grid>
      </Grid>
    </PageContainer>)
  );
};

export default WidgetCards;
