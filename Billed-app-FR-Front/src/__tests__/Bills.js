/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBe(true)


    })

    test("Then it should format the bills with formatDate and formatStatus", async () => {
      const billsMock = [
        { date: '2023-09-01', status: 'pending' },
        { date: '2023-10-01', status: 'accepted' },
      ];

      const storeMock = {
        bills: jest.fn(() => ({
          list: jest.fn(() => Promise.resolve(billsMock)),
        })),
      };

      // Mock the document with the necessary querySelector method
      const documentMock = {
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(),
      };

      // Mock the formatDate and formatStatus functions
      const formatDate = jest.spyOn(require("../app/format.js"), "formatDate");
      const formatStatus = jest.spyOn(require("../app/format.js"), "formatStatus");

      const billsContainer = new Bills({ document: documentMock, store: storeMock });
      await billsContainer.getBills();

      // Verify that formatDate and formatStatus are called for each bill
      expect(formatDate).toHaveBeenCalledWith('2023-09-01');
      expect(formatStatus).toHaveBeenCalledWith('pending');
      expect(formatDate).toHaveBeenCalledWith('2023-10-01');
      expect(formatStatus).toHaveBeenCalledWith('accepted');
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.data)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Then eye icons should have click event listeners attached", () => {
      const addEventListenerMock = jest.fn();

      // Mocking querySelectorAll to return two mock icon elements
      const documentMock = {
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(() => [
          { addEventListener: addEventListenerMock },
          { addEventListener: addEventListenerMock },
        ]),
      };

      const onNavigate = jest.fn();
      const storeMock = {};

      // Instantiate Bills class with the mocked document
      const billsContainer = new Bills({ document: documentMock, onNavigate, store: storeMock });

      // Check if querySelectorAll was called with the correct selector
      expect(documentMock.querySelectorAll).toHaveBeenCalledWith('div[data-testid="icon-eye"]');

      // Check if addEventListener was called with 'click' and a function for each icon element
      expect(addEventListenerMock).toHaveBeenCalledTimes(2);
      expect(addEventListenerMock).toHaveBeenCalledWith('click', expect.any(Function));
    });

    //GET BILLS
    test("Then it should call store.bills().list()", async () => {
      const listMock = jest.fn(() => Promise.resolve([]));

      const storeMock = {
        bills: jest.fn(() => ({
          list: listMock,
        })),
      };

      // Mock the document with the necessary querySelector method
      const documentMock = {
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(),
      };

      const billsContainer = new Bills({ document: documentMock, store: storeMock });
      await billsContainer.getBills();

      expect(storeMock.bills).toHaveBeenCalled();
      expect(listMock).toHaveBeenCalled();
    });
  })


  describe("When I click on the eye icon of a bill", () => {
    test("Then a modal should open displaying the bill proof", () => {
      // Mock document.querySelector and document.querySelectorAll for the modal behavior
      const documentMock = {
        querySelector: jest.fn((selector) => {
          if (selector === '#modaleFile') {
            return {
              // Simulate a modal element with jQuery-like 'find', 'modal' and other methods
              find: jest.fn(() => ({
                html: jest.fn(),
              })),
              modal: jest.fn(),
            };
          }
          return null;
        }),
        querySelectorAll: jest.fn(() => ([])),  // Mocking querySelectorAll to avoid the error
      };

      // Mock icon element
      const icon = { getAttribute: jest.fn(() => 'https://test-bill-url.com') };
      const modalShow = jest.fn();
      const modalHtml = jest.fn();

      // Mock jQuery behavior globally, including the click and width methods
      global.$ = jest.fn(() => ({
        find: jest.fn(() => ({ html: modalHtml })),
        modal: modalShow,
        width: jest.fn(() => 1000),  // Mocking the width function to return a fixed width (e.g., 1000px)
        click: jest.fn(),  // Mocking the click function to avoid errors
      }));

      // Instantiate Bills class with the mocked document
      const billsContainer = new Bills({ document: documentMock });
      billsContainer.handleClickIconEye(icon);

      // Verify the modal is shown and the correct URL is set in the HTML
      expect(modalHtml).toHaveBeenCalledWith(expect.stringContaining('https://test-bill-url.com'));
      expect(modalShow).toHaveBeenCalledWith('show');
    });
  });
})


















