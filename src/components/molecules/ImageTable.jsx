import React from "react";
import StatusBadge from "../atoms/StatusBadge";
import { Table, Thead, Tbody } from "../../styles/TableStyle";
import styled from "styled-components";
import { Link } from "react-router-dom";

const ImageTableContainer = styled.div`
  flex: 1;
  margin-top: 40px;
  padding-bottom: 40px;

  h3 {
    margin-bottom: 30px;
  }
`;
const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
  text-decoration: underline;
`;
export default function ImageTable({ imageData }) {
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
          {imageData.map((item, index) => (
            <tr key={index}>
              <td>{(index + 1).toString().padStart(2, "0")}</td>
              <td>
                <StyledLink to={`/labeling`}>{item.fileName}</StyledLink>
              </td>
              <td>{<StatusBadge status={item.status} />}</td>
            </tr>
          ))}
        </Tbody>
      </Table>
    </ImageTableContainer>
  );
}
