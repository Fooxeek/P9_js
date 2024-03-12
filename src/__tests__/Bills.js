import { screen, waitFor } from "@testing-library/dom";

import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store.js";

import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

// Mock du store pour les tests
jest.mock("../app/store", () => mockStore);

// Teste le rendu de la page de chargement lorsque la page est en cours de chargement
describe("When I am on Bills page but it is loading", () => {
  test("Then, loading page should be rendered", () => {
    // Simulation d'une page en cours de chargement
    document.body.innerHTML = BillsUI({ loading: true });
    // Vérification que le texte "Loading..." est présent
    expect(screen.getAllByText("Loading...")).toBeTruthy();
  });
});
// Teste le comportement lorsque l'utilisateur est connecté en tant qu'employé
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // Teste si l'icône de la page des factures est sélectionnée dans la mise en page verticale
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Configuration de l'utilisateur comme employé dans le stockage local
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      // Création de l'élément racine et configuration du routeur
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      // Navigation vers la page des factures
      window.onNavigate(ROUTES_PATH.Bills);
      // Attente de l'affichage de l'icône de la fenêtre
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");

      // Vérification si l'icône est active
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    });
    // Teste si les factures sont triées de la plus ancienne à la plus récente
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    // Teste si un modal s'ouvre lorsque l'icône 'eye' est cliquée
    test("Then a modal should open when I clicked on eye icon", async () => {
      // Attente de l'affichage des icônes 'eye'
      await waitFor(() => screen.getAllByTestId("icon-eye"));
      const iconsEyes = screen.getAllByTestId("icon-eye");
      const iconEye = iconsEyes[0];
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const bill = new Bills({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });
      const modale = document.getElementById("modaleFile");
      $.fn.modal = jest.fn(() => modale.classList.add("show"));
      // Simulation du comportement de clic et vérification
      const handleClickIconEye = jest.fn(bill.handleClickIconEye(iconEye));
      iconEye.addEventListener("click", handleClickIconEye);
      userEvent.click(iconEye);
      expect(handleClickIconEye).toHaveBeenCalled();
      // Vérification que le modal est affiché
      expect(modale).toBeTruthy();
    });
  });
  // Teste si aucun icône 'eye' n'est présent lorsque les données sont vides
  test("no eye icon is present", async () => {
    // Créez une maquette de l'interface utilisateur sans icône "eye"
    document.body.innerHTML = BillsUI({ data: [] });

    // Vérifiez qu'aucun élément avec l'attribut data-testid="icon-eye" n'est présent
    const eyeIcons = screen.queryAllByTestId("icon-eye");
    expect(eyeIcons.length).toBe(0);
  });
});

// test d'intégration GET pour récupérer les données de facturation
describe("Given I am a user connected as Employee", () => {
  beforeAll(() => {
    document.body.innerHTML = BillsUI({ data: bills });
  });

  describe("When I am to Bills", () => {
    // Teste la récupération des factures depuis une API fictive
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // Attente de l'affichage des éléments de la page des factures
      await waitFor(() => {
        expect(screen.getByText("Mes notes de frais")).toBeTruthy();
        expect(screen.getByText("Hôtel et logement")).toBeTruthy();
      });
    });

    // Teste le comportement lorsque la date de facturation est corrompue
    test("when date is corrupted", async () => {
      // Remplacement de la méthode de récupération des factures par une réponse factice
      mockStore.bills().list = () => {
        return Promise.resolve([
          {
            id: "47qAXb6fIm2zOKkLzMro",
            vat: "80",
            fileUrl:
              "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
            status: "pending",
            type: "ERROR",
            commentary: "séminaire billed",
            name: "encore",
            fileName: "preview-facture-free-201801-pdf-1.jpg",
            amount: 400,
            commentAdmin: "ok",
            email: "a@a",
            pct: 20,
            date: "20000004-04-04",
          },
        ]);
      };
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      // Attente de l'affichage des éléments de la page des factures
      await waitFor(() => {
        expect(screen.getByText("ERROR")).toBeTruthy();
        expect(screen.getByText("20000004-04-04")).toBeTruthy();
      });
    });
  });
});

// Teste le comportement lors du clic sur le bouton 'New Bill'
describe("Given I am a user connected as Employee", () => {
  describe("When I click on new bill button", () => {
    test("Then new bill page should be rendered", () => {
      // Configuration de l'interface et simulation du clic sur le bouton
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      const bill = new Bills({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });
      const handleClickNewBill = jest.fn(bill.handleClickNewBill);
      const buttonNewBill = screen.getByTestId("btn-new-bill");
      buttonNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(buttonNewBill);
      // Vérification que la nouvelle page est rendue
      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });
});
