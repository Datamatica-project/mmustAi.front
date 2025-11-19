import React from "react";
import styled from "styled-components";
import ProgressBar from "../atoms/progressBar";
import ThreeDotsMenu from "../common/ThreeDotsMenu";
import { Link } from "react-router-dom";
import StatusBadge from "../atoms/StatusBadge";
import { Table, Thead, Tbody } from "../../styles/TableStyle";

const ColGroup = styled.colgroup`
  display: grid;
  grid-template-columns: 60px 200px 120px 300px 150px 60px;
`;

const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
  text-decoration: underline;
`;

export default function TaskTable({
  value,
  page = 1,
  pageSize = 10,
  projectId,
}) {
  return (
    <Table className="task-table">
      {/* <ColGroup>
        <col />
        <col />
        <col />
        <col />
        <col />
        <col />
      </ColGroup> */}

      <Thead>
        <tr>
          <th>No.</th>
          <th>Task Name</th>
          <th>Files</th>
          <th>Progress</th>
          <th>Status</th>
          <th></th>
        </tr>
      </Thead>

      <Tbody>
        {value.map((item, index) => {
          const rowNumber = (page - 1) * pageSize + index + 1;
          return (
            <tr key={index}>
              <td>{rowNumber.toString().padStart(2, "0")}</td>
              <td>
                <StyledLink to={`/project/${projectId}/task/${item.id}`}>
                  {item.name}
                </StyledLink>
              </td>
              <td>
                {item.current}/{item.total}
              </td>
              <td>
                {<ProgressBar value={(item.current / item.total) * 100} />}
              </td>
              <td>{<StatusBadge status={item.status} />}</td>
              <td>{<ThreeDotsMenu />}</td>
            </tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
