import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import mockStore from "../__mocks__/store"; // Mock de l'API


jest.mock("../app/store", () => mockStore); // Mock de store

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should render the NewBill form", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      const store = {};
      const newBill = new NewBill({ document, onNavigate, store });

      const form = screen.getByTestId('form-new-bill');
      expect(form).toBeTruthy();
    });
  });


  describe("When I upload a file in the NewBill form", () => {
    test("Then it should reject invalid file types", () => {
      localStorage.setItem("user", JSON.stringify({ email: "test@employee.com" }));

      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      const store = mockStore;
      const newBill = new NewBill({ document, onNavigate, store });

      const file = new File(['document'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByTestId("file");

      fireEvent.change(fileInput, { target: { files: [file] } });
      expect(fileInput.value).toBe('');
    });
  });

  describe("When I submit the form with all required fields filled", () => {
    //POST NEW BILL
    test("Then it should create a new bill", async () => {
      localStorage.setItem("user", JSON.stringify({ email: "test@employee.com" }));

      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      const store = mockStore;
      const newBill = new NewBill({ document, onNavigate, store });

      // Fill in all required fields
      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } });
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Vol Paris-Tokyo" } });
      fireEvent.change(screen.getByTestId("amount"), { target: { value: "400" } });
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2023-10-10" } });
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "70" } });
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } });
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Déplacement professionnel" } });

      // Simulate file upload
      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByTestId("file");
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Simulate form submission
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      await waitFor(() => {
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
      });
    });

    test("Then it should not create a bill if a required field is missing", async () => {
      localStorage.setItem("user", JSON.stringify({ email: "test@employee.com" }));

      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      const store = mockStore;
      const newBill = new NewBill({ document, onNavigate, store });

      // Remplir partiellement les champs (sans amount par exemple)
      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } });
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Vol Paris-Tokyo" } });
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2023-10-10" } });
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "70" } });
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } });
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Déplacement professionnel" } });

      // Simuler l'upload d'un fichier valide
      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByTestId("file");
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Simuler la soumission du formulaire
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      // Vérifier qu'il manque le champ 'amount'
      expect(screen.getByTestId("amount").value).toBe('');

      // La fonction onNavigate ne doit pas être appelée car il manque un champ requis
      expect(onNavigate).not.toHaveBeenCalled();
    });

  });
});

//ERROR 404, 500
describe("When I submit the form and receive a 404 error from the API", () => {
  test("Then it should log an error message in the console", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@employee.com" }));

    const html = NewBillUI();
    document.body.innerHTML = html;

    const onNavigate = jest.fn();
    const store = {
      bills: jest.fn(() => ({
        create: jest.fn(() => Promise.reject(new Error("Erreur 404")))
      }))
    };

    const newBill = new NewBill({ document, onNavigate, store });

    // Mock console.error
    console.error = jest.fn();

    // Fill in all required fields
    fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } });
    fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Vol Paris-Tokyo" } });
    fireEvent.change(screen.getByTestId("amount"), { target: { value: "400" } });
    fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2023-10-10" } });
    fireEvent.change(screen.getByTestId("vat"), { target: { value: "70" } });
    fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } });
    fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Déplacement professionnel" } });

    // Simulate file upload
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByTestId("file");
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Simulate form submission
    const form = screen.getByTestId("form-new-bill");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(new Error("Erreur 404"));
    });
  });
});

describe("When I submit the form and receive a 500 error from the API", () => {
  test("Then it should log an error message in the console", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@employee.com" }));

    const html = NewBillUI();
    document.body.innerHTML = html;

    const onNavigate = jest.fn();
    const store = {
      bills: jest.fn(() => ({
        create: jest.fn(() => Promise.reject(new Error("Erreur 500")))
      }))
    };

    const newBill = new NewBill({ document, onNavigate, store });

    // Mock console.error
    console.error = jest.fn();

    // Fill in all required fields
    fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } });
    fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Vol Paris-Tokyo" } });
    fireEvent.change(screen.getByTestId("amount"), { target: { value: "400" } });
    fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2023-10-10" } });
    fireEvent.change(screen.getByTestId("vat"), { target: { value: "70" } });
    fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } });
    fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Déplacement professionnel" } });

    // Simulate file upload
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByTestId("file");
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Simulate form submission
    const form = screen.getByTestId("form-new-bill");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(new Error("Erreur 500"));
    });
  });
});






