import PageContainer from 'src/components/container/PageContainer';
import HeaderAlert from '@/src/components/frontend-pages/shared/header/HeaderAlert';
import HpHeader from '@/src/components/frontend-pages/shared/header/HpHeader';

import C2a from '@/src/components/frontend-pages/shared/c2a';
import Footer from '@/src/components/frontend-pages/shared/footer';
import Banner from '@/src/components/frontend-pages/contact/banner';
import Form from '@/src/components/frontend-pages/contact/form';
import ScrollToTop from '@/src/components/frontend-pages/shared/scroll-to-top';

const Contact = () => {
    return (
        <PageContainer title="Contact" description="this is Contact">

            <HeaderAlert />
            <HpHeader />
            <Banner />
            <Form />
            <C2a />
            <Footer />
            <ScrollToTop />
        </PageContainer>
    );
};

export default Contact;
