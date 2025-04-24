import React from "react";

import { fireEvent, render } from "@testing-library/react";
import '@testing-library/jest-dom';

import Application from "../Application";

describe("Application", () => {
  it("defaults to Monday and changes the schedule when a new day is selected", () => {
    const { queryByText, findByText } = render(<Application />);
  
    return findByText("Monday").then(() => {
      fireEvent.click(queryByText("Tuesday"));
      expect(queryByText("Leopold Silvers")).toBeInTheDocument();
    });
  });

});
