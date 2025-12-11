import React, { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default ({ width, height = 6, style }) => {
  const theme = useContext(ThemeContext);

  return (
    <SkeletonTheme
      baseColor={theme.skeleton?.baseColor || "#eae0df"}
      highlightColor={theme.skeleton?.highlightColor || "#c9c8cc"}
      width={width}
      height={height}
    >
      <Skeleton style={{ zIndex: 0, ...style }} wrapper={Container} />
    </SkeletonTheme>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  line-height: inherit;
`;
