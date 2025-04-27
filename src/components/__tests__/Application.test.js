import React from "react";
import axios from "axios";

import { fireEvent, render, prettyDOM, findByText, getAllByTestId, getByText, getByAltText, getByPlaceholderText, queryByText, queryByAltText, findByAltText } from "@testing-library/react";
import '@testing-library/jest-dom';
import { within } from "@testing-library/react"; // Add this at the top

import Application from "../Application";

describe("Application", () => {
  // Test #1
  it("defaults to Monday and changes the schedule when a new day is selected", () => {
    const { queryByText, findByText } = render(<Application />);
  
    return findByText("Monday").then(() => {
      fireEvent.click(queryByText("Tuesday"));
      expect(queryByText("Leopold Silvers")).toBeInTheDocument();
    });
  });
  // Test #2
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

  // Test #3
  it("loads data, cancels an interview and increases the spots remaining for Monday by 1", async () => {
    // 1. Render the Application.
    const { container } = render(<Application />);
  
    // 2. Wait until the text "Archie Cohen" is displayed.
    await findByText(container, "Archie Cohen");

    // Find the appointment with "Archie Cohen"
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments.find((appointment) =>
      queryByText(appointment, "Archie Cohen")
    );

    // 3. Click the "Delete" button on the booked appointment.
    fireEvent.click(queryByAltText(appointment, "Delete"));

    // 4. Check that the confirmation message is shown.
    expect(getByText(appointment, "Are you sure you would like to delete?")).toBeInTheDocument();

    // 5. Click the "Confirm" button on the confirmation.
    fireEvent.click(queryByText(appointment, "Confirm"));

    // 6. Check that the element with the text "Deleting" is displayed.
    expect(getByText(appointment, "Deleting")).toBeInTheDocument();    

    // 7. Wait until the element with the "Add" button is displayed.
    await findByAltText(appointment, "Add");

    // 8. Check that the DayListItem with the text "Monday" also has the text "2 spots remaining".
    const day = getAllByTestId(container, "day").find((day) => queryByText(day, "Monday"));

    expect(getByText(day, "2 spots remaining")).toBeInTheDocument();
  });

  // Test #4
  it("loads data, edits an interview and keeps the spots remaining for Monday the same", async () => {
    // Render the Application.
    const { container } = render(<Application />);
  
    // Wait until the text "Archie Cohen" is displayed.
    await findByText(container, "Archie Cohen");

    // Find the appointment with "Archie Cohen"
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments.find((appointment) =>
      queryByText(appointment, "Archie Cohen")
    );

    // Click the "Edit" button on the appointment.
    fireEvent.click(queryByAltText(appointment, "Edit"));

    // Change the student name
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Archie Edited" }
    });

    // Click the "Save" button
    fireEvent.click(getByText(appointment, "Save")); 
    
    // Wait for the appointment to show the new name
    await findByText(appointment, "Archie Edited");

    // Check that the spots remaining for Monday has not changed
    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );

    expect(getByText(day, "1 spot remaining")).toBeInTheDocument();
  });

  // Test #5
  it("shows the save error when failing to save an appointment", async() => {
    // Mock the axios.put call to reject
    axios.put.mockRejectedValueOnce(new Error("Save failed"));

    const { container } = render(<Application />);

    await findByText(container, "Archie Cohen");

    // Get the first empty appointment
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments.find(app => queryByAltText(app, "Add"));

    fireEvent.click(getByAltText(appointment, "Add"));

    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" }
    });

    // Select an interviewer
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));

    fireEvent.click(getByText(appointment, "Save"));

    // Expect the "Saving" message
    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    // Wait for the error message to appear
    await findByText(appointment, "Could not save appointment.");

    // Optional: check that the error UI (like a close button) is shown
    expect(getByAltText(appointment, "Close")).toBeInTheDocument();
  });

  it("shows the delete error when failing to delete an existing appointment", async () => {
    axios.delete.mockRejectedValueOnce(new Error("Delete failed"));

    const { container } = render(<Application />);

    await findByText(container, "Archie Cohen");

    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments.find(app =>
      queryByText(app, "Archie Cohen")
    );

    fireEvent.click(getByAltText(appointment, "Delete"));

    // Confirm the delete action
    expect(getByText(appointment, "Are you sure you would like to delete?")).toBeInTheDocument();
    fireEvent.click(getByText(appointment, "Confirm"));

    expect(getByText(appointment, "Deleting")).toBeInTheDocument();

    await findByText(appointment, "Could not delete appointment.");

    // Check that the Close button is visible so the user can dismiss the error
    expect(getByAltText(appointment, "Close")).toBeInTheDocument();
  });

});
