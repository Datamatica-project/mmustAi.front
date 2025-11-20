import React from "react";
import StatusBadge from "../atoms/StatusBadge";
import { Table, Thead, Tbody } from "../../styles/TableStyle";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Pagination from "../common/Pagination";

const ImageTableContainer = styled.div`
  flex: 1;
  margin-top: 40px;
  padding-bottom: 40px;
  min-height: 900px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  h3 {
    margin-bottom: 30px;
  }
`;
const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
  text-decoration: underline;
`;
export default function ImageTable({ imageData, page, pageSize, setPage }) {
  const paginateDate = imageData.slice((page - 1) * pageSize, page * pageSize);
  return (
    <ImageTableContainer>
      <h3>image list</h3>
      <Table>
        <Thead>
          <tr>
            <th>No.</th>
            <th>File Name</th>
            <th>status</th>
          </tr>
        </Thead>
        <Tbody>
          {paginateDate.map((item, index) => {
            const rowNumber = (page - 1) * pageSize + index + 1;
            return (
              <tr key={index}>
                <td>{rowNumber.toString().padStart(2, "0")}</td>
                <td>
                  <StyledLink to={`/labeling`}>{item.fileName}</StyledLink>
                </td>
                <td>{<StatusBadge status={item.status} />}</td>
              </tr>
            );
          })}
        </Tbody>
      </Table>
      <Pagination
        total={imageData.length}
        page={page}
        pageSize={pageSize}
        onChange={setPage}
      />
    </ImageTableContainer>
  );
}
