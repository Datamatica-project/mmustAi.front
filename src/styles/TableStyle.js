import styled from "styled-components";

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const Thead = styled.thead`
  color: #9c9ec9;
  font-size: 16px;
  font-weight: 400;
  line-height: 3;
`;

export const Tbody = styled.tbody`
  color: white;
  font-size: 16px;
  font-weight: 400;
  line-height: 2;
  tr {
    border-bottom: 1px solid #353656;
  }
  td {
    padding-top: 15px;
    padding-bottom: 15px;
    text-align: center;
  }
`;
