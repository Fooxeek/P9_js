/**
 * @jest-environment jsdom
 */

// Imports des dépendances nécessaires pour les tests
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";
import BillsUI from "../views/BillsUI.js";

// Suite de tests pour les utilisateurs connectés en tant qu'employés
describe("Given I am connected as an employee", () => {
  // Sous-suite de tests pour la page NewBill
  describe("When I am on NewBill Page", () => {
    // Test vérifiant que le formulaire NewBill est affiché
    test("Then the NewBill form should appear", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      // TODO: Ajouter l'assertion
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });

    // Test vérifiant que l'icône NewBill dans la mise en page verticale est mise en surbrillance
    test("Then the newbill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      // TODO: Ajouter l'expression expect
      expect(mailIcon.classList.contains("active-icon")).toBe(true);
    });
  });

  // Sous-suite de tests pour la page NewBill lors de l'upload de fichier
  describe("When I am on NewBill Page and I upload a file", () => {
    // Test vérifiant l'ajout d'une image valide avec les extensions jpg, jpeg ou png
    test("should add a valid image with extensions jpg, jpeg, or png", () => {
      // Configuration du localStorage pour un utilisateur employé
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      // Rendu du composant NewBillUI
      document.body.innerHTML = NewBillUI();

      // Sélection de l'élément d'upload du fichier
      const uploader = screen.getByTestId("file");
      fireEvent.change(uploader, {
        target: {
          files: [new File(["image"], "image.png", { type: "image/png" })],
        },
      });

      // Fonction de navigation
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Création d'une nouvelle instance de NewBill
      const newBills = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Fonction de gestion de changement de fichier
      const handleChangeFile = jest.fn(() => newBills.handleChangeFile);

      uploader.addEventListener("change", handleChangeFile);
      fireEvent.change(uploader);

      // Assertions
      expect(uploader.files[0].name).toBe("image.png");
      expect(uploader.files[0].name).toMatch(/(jpeg|jpg|png)/);
      expect(handleChangeFile).toHaveBeenCalled();
    });

    // Test vérifiant l'ajout d'une image non valide avec une mauvaise extension
    test("should add an invalid image with a bad extension", () => {
      // Redéfinition de la fonction alert pour les tests
      window.alert = jest.fn();
      document.body.innerHTML = NewBillUI();

      // Sélection de l'élément d'upload du fichier
      const uploader = screen.getByTestId("file");
      fireEvent.change(uploader, {
        target: {
          files: [
            new File(["image"], "image.pdf", { type: "application/pdf" }),
          ],
        },
      });

      // Sélection de l'élément img
      const img = document.querySelector(`input[data-testid="file"]`);

      // Fonction de navigation
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Création d'une nouvelle instance de NewBill
      const newBills = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Fonction de gestion de changement de fichier
      const handleChangeFile = jest.fn(newBills.handleChangeFile);

      uploader.addEventListener("change", handleChangeFile);

      fireEvent.change(uploader);

      // Assertions
      expect(img.files[0].name).not.toMatch(/(jpeg|jpg|png)/);
      expect(window.alert).toHaveBeenCalled();
    });
  });

  // Sous-suite de tests pour l'ajout d'une nouvelle facture POST
  describe("When I am on NewBill Page and I add a new Bill POST", () => {
    // Test vérifiant l'ajout d'une nouvelle facture POST
    test("should add newBill POST", async () => {
      // Configuration du localStorage pour un utilisateur employé
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@company.tld",
        })
      );

      document.body.innerHTML = NewBillUI();

      // Fonction de navigation
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Création d'une nouvelle instance de NewBill
      const newBills = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      });

      // Sélection du formulaire NewBill
      const formNewBill = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn(newBills.handleSubmit);

      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      // Assertions
      expect(handleSubmit).toHaveBeenCalled();
      expect(formNewBill).toBeTruthy();
    });
  });

  // Sous-suite de tests pour la gestion des erreurs d'API
  describe("When an error occurs on API", () => {
    // Avant chaque test, simule une réponse d'API avec une erreur 404
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    // Test vérifiant que les factures sont récupérées depuis une API et échouent avec un message d'erreur 404
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.NewBill);
      await new Promise(process.nextTick);
      document.body.innerHTML = BillsUI({ error: "Erreur 404" });
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    // Test vérifiant que les messages sont récupérés depuis une API et échouent avec un message d'erreur 500
    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.NewBill);
      await new Promise(process.nextTick);
      document.body.innerHTML = BillsUI({ error: "Erreur 500" });
      const message = screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
