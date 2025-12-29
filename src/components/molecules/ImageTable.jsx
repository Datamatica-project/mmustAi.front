import React, { useEffect, useState } from "react";
import StatusBadge from "../atoms/StatusBadge";
import { Table, Thead, Tbody } from "../../styles/TableStyle";
import styled from "styled-components";
import { Link, useParams } from "react-router-dom";
import Pagination from "../common/Pagination";
import { useProjectRolesStore } from "../../store/authStore";
import { getProjects } from "../../api/Project";

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
  &.disabled {
    color: gray;
    text-decoration: none;
    cursor: default;
  }
  display: block;
  color: white;
  text-decoration: underline;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 70%;
`;
export default function ImageTable({ imageData, page, pageSize, setPage }) {
  const { projectId, taskId } = useParams();
  const [projectRoles, setProjectRoles] = useState(null);
  const paginateDate = imageData?.items?.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // 사용자 역할 탐색 로직 (추후 변경)
  useEffect(() => {
    const fetchProjects = async () => {
      const response = await getProjects();
      const projectRoles = response.data.items.find(
        (item) => item.id === +projectId
      );
      setProjectRoles(projectRoles.role);
    };
    fetchProjects();
  }, [projectId]);

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
          {paginateDate?.map((item, index) => {
            const rowNumber = (page - 1) * pageSize + index + 1;
            return (
              <tr key={index}>
                <td>{rowNumber.toString().padStart(2, "0")}</td>
                <td className="file-name">
                  {projectRoles === "REVIEWER" ? (
                    <StyledLink
                      to={
                        item.status.toLowerCase() === "waiting"
                          ? `/project/${projectId}/task/${taskId}/reviewing/${item.id}`
                          : false
                      }
                      className={
                        item.status.toLowerCase() !== "waiting"
                          ? "disabled"
                          : ""
                      }
                      // state={{ fileId: item.fileId, fileName: item.fileName }}
                    >
                      {item.fileName}
                    </StyledLink>
                  ) : (
                    <StyledLink
                      to={`/project/${projectId}/task/${taskId}/labeling/${item.id}`}
                      // to={`/project/${projectId}/task/${taskId}/reviewing/${item.id}`}
                      // state={{ fileId: item.fileId, fileName: item.fileName }}
                    >
                      {item.fileName}
                    </StyledLink>
                  )}
                </td>
                <td>{<StatusBadge status={item.status.toLowerCase()} />}</td>
              </tr>
            );
          })}
        </Tbody>
      </Table>
      <Pagination
        total={imageData.items.length}
        page={page}
        pageSize={pageSize}
        onChange={setPage}
      />
    </ImageTableContainer>
  );
}
