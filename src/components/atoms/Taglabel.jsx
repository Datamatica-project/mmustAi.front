import React from "react";
import styled from "styled-components";

const TagLabel = styled.div`
  background-color: ${({ $color }) => $color};
  border-radius: 5px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
`;
export default function Taglabel({ label, color }) {
  return (
    <TagLabel className="tag-label" $color={color}>
      {label}
    </TagLabel>
  );
}
