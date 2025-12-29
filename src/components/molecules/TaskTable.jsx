import React from "react";
import styled from "styled-components";
import ProgressBar from "../atoms/ProgressBar";
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
        {value?.map((item, index) => {
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
                {item.completedJobCount}/{item.jobCount}
              </td>
              <td>
                {
                  <ProgressBar
                    value={(item.completedJobCount / item.jobCount) * 100}
                  />
                }
              </td>
              <td>{<StatusBadge status={item.status.toLowerCase()} />}</td>
              {/* <td>{<ThreeDotsMenu />}</td> */}
            </tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
