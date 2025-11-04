import React from 'react';
import styled from 'styled-components';

export default ({ header, footer, children }) => {
  const [menu, content] = React.Children.toArray(children);
  return (
    <>
      <Layout>
        {header}
        <PageContainer>
          {menu}
          <ContentContainer>
            {content}
          </ContentContainer>
        </PageContainer>
        {footer}
      </Layout>
    </>
  );
};

const Layout = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 14px 40px 40px;
  @media only screen and (max-width: 560px) {
    padding: 21px 7px 28px;
  }
  @media only screen and (max-width: 800px) {
    padding-bottom: 80px;
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  flex: 1;
  gap: 32px;
  margin: 80px 0;
  position: relative;
  @media only screen and (max-width: 560px) {
    margin: 30px 0;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${props => props.theme.color.white};
  border-radius: 8px;
  border: 2px solid ${props => props.theme.color.black};
  padding: 16px 12px;

  @media only screen and (max-width: 560px) {
    margin: 30px 0;
  }
`;

