import React from "react";

import { fireEvent, render, prettyDOM, findByText, getAllByTestId, getByText, getByAltText, getByPlaceholderText } from "@testing-library/react";
import '@testing-library/jest-dom';
import { within } from "@testing-library/react"; // Add this at the top

import Application from "../Application";

describe("Application", () => {
  it("defaults to Monday and changes the schedule when a new day is selected", () => {
    const { queryByText, findByText } = render(<Application />);
  
    return findByText("Monday").then(() => {
      fireEvent.click(queryByText("Tuesday"));
      expect(queryByText("Leopold Silvers")).toBeInTheDocument();
    });
  });

  it("loads data, books an interview and reduces the spots remaining for Monday by 1", async () => {
    const { container, debug, queryByText } = render(<Application />);
  
    await findByText(container, "Archie Cohen");

    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments[0];

    fireEvent.click(getByAltText(appointment, "Add"));

    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" }
    });

    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));
    fireEvent.click(getByText(appointment, "Save"));

    // Check for the "Saving" text
    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    // Wait for the "Saving" indicator to disappear and confirm student's name is shown
    await findByText(appointment, "Lydia Miller-Jones");
    const days = getAllByTestId(container, "day");
    const monday = days.find(day => within(day).queryByText("Monday"));

    expect(within(monday).getByText("no spots remaining")).toBeInTheDocument();
  });

});
