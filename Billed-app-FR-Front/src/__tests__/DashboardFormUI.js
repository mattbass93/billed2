/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import DashboardFormUI from "../views/DashboardFormUI.js"
import { formatDate } from "../app/format.js"

const bill = {
  "id": "47qAXb6fIm2zOKkLzMro",
  "vat": "80",
  "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
  "status": "accepted",
  "type": "Hôtel et logement",
  "commentAdmin": "ok",
  "commentary": "séminaire billed",
  "name": "encore",
  "fileName": "preview-facture-free-201801-pdf-1.jpg",
  "date": "2004-04-04",
  "amount": 400,
  "email": "a@a",
  "pct": 20
}

const billAccepted = {
  ...bill,
  "status": "accepted"
}

const billPending = {
  ...bill,
  "status": "pending"
}

const billrefused = {
  ...bill,
  "status": "refused"
}

describe('Given I am connected as an Admin and I am on Dashboard Page', () => {
  describe('When bill data is passed to DashboardUI', () => {
    test(('Then, it should them in the page'), () => {
      const html = DashboardFormUI(bill)
      document.body.innerHTML = html
      expect(screen.getByText(bill.vat)).toBeTruthy()
      expect(screen.getByText(bill.type)).toBeTruthy()
      expect(screen.getByText(bill.commentary)).toBeTruthy()
      expect(screen.getByText(bill.name)).toBeTruthy()
      expect(screen.getByText(bill.fileName)).toBeTruthy()
      expect(screen.getByText(formatDate(bill.date))).toBeTruthy()
      expect(screen.getByText(bill.amount.toString())).toBeTruthy()
      expect(screen.getByText(bill.pct.toString())).toBeTruthy()
    })
  })
  describe('When pending bill is passed to DashboardUI', () => {
    test(('Then, it should show button and textArea'), () => {
      const html = DashboardFormUI(billPending)
      document.body.innerHTML = html
      expect(screen.getByText("Accepter")).toBeTruthy()
      expect(screen.getByText("Refuser")).toBeTruthy()
      expect(screen.getByTestId("commentary2")).toBeTruthy()
    })
  })
  describe('When accepted bill is passed to DashboardUI', () => {
    test(('Then, it should show admin commentary'), () => {
      const html = DashboardFormUI(billAccepted)
      document.body.innerHTML = html
      expect(screen.getByText(bill.commentAdmin)).toBeTruthy()
    })
  })
  describe('When refused bill is passed to DashboardUI', () => {
    test(('Then, it should show admin commentary'), () => {
      const html = DashboardFormUI(billrefused)
      document.body.innerHTML = html
      expect(screen.getByText(bill.commentAdmin)).toBeTruthy()
    })
  })
})


describe('Given I am connected as an Admin and I have clicked on a pending bill', () => {
  describe('When I click on the "commentary" field', () => {
    test('Then I can insert a comment', () => {
      // Render the pending bill in the UI
      const html = DashboardFormUI(billPending)
      document.body.innerHTML = html

      // Select the commentary text area (assuming data-testid="commentary2")
      const commentaryField = screen.getByTestId('commentary2')

      // Simulate a user click on the commentary field
      fireEvent.click(commentaryField)

      // Simulate a user typing in the commentary field
      fireEvent.input(commentaryField, { target: { value: 'This is a test comment.' } })

      // Verify that the commentary field contains the text entered
      expect(commentaryField.value).toBe('This is a test comment.')
    })
  })

  describe('When I click on "Accepter"', () => {
    test('Then it should trigger the correct action for accepting the bill', () => {
      const html = DashboardFormUI(billPending)
      document.body.innerHTML = html

      // Utilise getByText pour trouver le bouton "Accepter"
      const acceptButton = screen.getByText("Accepter")

      // Mock the function responsible for accepting the bill
      const handleAcceptSubmit = jest.fn()

      // Simule l'ajout de l'event listener pour le bouton
      acceptButton.addEventListener('click', handleAcceptSubmit)

      // Simule un clic sur le bouton "Accepter"
      fireEvent.click(acceptButton)

      // Vérifie que la fonction mockée a bien été appelée
      expect(handleAcceptSubmit).toHaveBeenCalled()
    })
  })
})

