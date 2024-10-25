import { screen, fireEvent } from "@testing-library/dom";
import Dashboard from "../containers/Dashboard.js";
import { ROUTES_PATH } from "../constants/routes";

describe("Given I am an admin on the dashboard page", () => {
  describe("When I click on an icon to view a bill's details", () => {
    test("Then it should display the bill in a modal", () => {
      // Mock the necessary elements in the DOM
      document.body.innerHTML = `
        <div id="modaleFileAdmin1" class="modal">
          <div class="modal-body"></div>
        </div>
        <div id="icon-eye-d" data-bill-url="test.jpg"></div>
      `;

      // Mock the necessary functions
      const dashboard = new Dashboard({
        document,
        onNavigate: jest.fn(),
        store: null,
        bills: [],
      });

      // Call the handleClickIconEye method
      dashboard.handleClickIconEye();

      // Check that the modal is displayed with the correct image
      expect(document.querySelector("#modaleFileAdmin1 .modal-body").innerHTML).toContain("test.jpg");
    });
  });

  describe("When I accept a bill", () => {
    test("Then the bill should be updated with the accepted status", () => {
      // Mock the necessary elements in the DOM
      document.body.innerHTML = `<textarea id="commentary2">Approved by admin</textarea>`;

      // Create a bill object
      const bill = {
        id: "1",
        status: "pending",
        fileUrl: "test.jpg",
        fileName: "test.jpg",
      };

      // Mock the store and onNavigate functions
      const updateBillMock = jest.fn(() => Promise.resolve({})); // Return a resolved promise
      const onNavigateMock = jest.fn();

      const dashboard = new Dashboard({
        document,
        onNavigate: onNavigateMock,
        store: { bills: jest.fn(() => ({ update: updateBillMock })) },
        bills: [bill],
      });


      // Call the handleAcceptSubmit method
      dashboard.handleAcceptSubmit({}, bill);

      // Verify that the bill was updated with the correct data in stringified JSON format
      expect(updateBillMock).toHaveBeenCalledWith({
        data: JSON.stringify({
          ...bill,
          status: "accepted",
          commentAdmin: "Approved by admin"
        }),
        selector: bill.id
      });

      // Verify that the user was redirected to the dashboard
      expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH["Dashboard"]);
    });
  });

  describe("When I refuse a bill", () => {
    test("Then the bill should be updated with the refused status and the correct comment, and I should be redirected to the dashboard", () => {
      // Mock the necessary elements in the DOM
      document.body.innerHTML = `<textarea id="commentary2">This is a test comment</textarea>`;

      // Create a bill object to pass to the method
      const bill = {
        id: "1",
        status: "pending",
        fileUrl: "test.jpg",
        fileName: "test.jpg",
        commentAdmin: "Need more details"
      };

      // Mock the store and onNavigate functions
      const updateBillMock = jest.fn(() => Promise.resolve({})); // Return a resolved promise
      const onNavigateMock = jest.fn();

      const dashboard = new Dashboard({
        document,
        onNavigate: onNavigateMock,
        store: { bills: jest.fn(() => ({ update: updateBillMock })) },
        bills: [bill],
      });

      // Call the handleRefuseSubmit method
      dashboard.handleRefuseSubmit({}, bill);

      // Verify that the bill was updated with the correct data in stringified JSON format
      expect(updateBillMock).toHaveBeenCalledWith({
        data: JSON.stringify({
          ...bill,
          status: "refused",
          commentAdmin: "This is a test comment"
        }),
        selector: bill.id
      });

      // Verify that the user was redirected to the dashboard
      expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH["Dashboard"]);
    });
  });

  describe("When I display the tickets with handleShowTickets", () => {
    test("Then the tickets should be displayed and clickable for editing", () => {
      // Mock the necessary elements in the DOM
      document.body.innerHTML = `
        <div id="arrow-icon1"></div>
        <div id="status-bills-container1"></div>
      `;

      // Create bills array with email to avoid split error
      const bills = [
        { id: "1", name: "Bill 1", date: "2022-01-01", amount: 100, status: "pending", email: "john.doe@email.com" },
        { id: "2", name: "Bill 2", date: "2022-02-01", amount: 200, status: "accepted", email: "jane.doe@email.com" }
      ];

      // Mock the necessary functions
      const dashboard = new Dashboard({
        document,
        onNavigate: jest.fn(),
        store: null,
        bills: bills,
      });

      // Spy on the handleEditTicket method
      const handleEditTicketSpy = jest.spyOn(dashboard, 'handleEditTicket');

      // Call handleShowTickets
      dashboard.handleShowTickets({}, bills, 1);

      // Check that the tickets are displayed
      expect(document.querySelector("#status-bills-container1").innerHTML).toContain("Bill 1");

      // Simulate clicking on a bill to edit it
      fireEvent.click(document.querySelector("#open-bill1"));

      // Check that handleEditTicket was called
      expect(handleEditTicketSpy).toHaveBeenCalledWith(expect.anything(), bills[0], bills);
    });
  });
});




