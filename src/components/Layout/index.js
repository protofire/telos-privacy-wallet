import React from 'react';
import styled from 'styled-components';
import TotalAssetBalance from 'containers/TotalAssetBalance'
export default ({ header, footer, children }) => {
  const [menu, content] = React.Children.toArray(children);
  return (
    <>
      <Layout>
        {header}
        <PageContainer>
          <TotalAssetBalance />
          <MenuAndPageContainer>
            {menu}
            <ContentContainer>
              {content}
            </ContentContainer>
          </MenuAndPageContainer>
        </PageContainer>
        {footer}
      </Layout>
    </>
  );
};

const Layout = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 14px 40px 40px;
  justify-content: space-between;
  gap: 40px;
  @media only screen and (max-width: 560px) {
    padding: 21px 7px 28px;
  }
  @media only screen and (max-width: 800px) {
    padding-bottom: 80px;
  }
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  margin: 0 auto;
`;

const MenuAndPageContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  flex: 1;
  gap: 32px;
  position: relative;
  @media only screen and (max-width: 560px) {
    margin: 30px 0;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
`;

