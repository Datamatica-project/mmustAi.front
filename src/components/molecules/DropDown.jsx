import React from "react";
import ListSection from "./ListSection";
import ClassLabel from "../atoms/ClassLabel";
import styled from "styled-components";
const DropDownContainer = styled.div`
  width: 100%;
`;

export default function DropDown({ classes, selectedClass, setSelectedClass }) {
  return (
    <DropDownContainer>
      <ListSection title={"Classes"}>
        {classes.map((cls) => (
          <ClassLabel
            key={cls.id}
            type="Class"
            color={cls.color}
            name={cls.name}
            isSelected={selectedClass === cls.id}
            onClick={() => setSelectedClass(cls.id)}
          >
            <input
              type="radio"
              name="class-selection"
              checked={selectedClass === cls.id}
              onChange={() => setSelectedClass(cls.id)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "18px",
                height: "18px",
                cursor: "pointer",
                accentColor: cls.color,
              }}
            />
          </ClassLabel>
        ))}
      </ListSection>
    </DropDownContainer>
  );
}
