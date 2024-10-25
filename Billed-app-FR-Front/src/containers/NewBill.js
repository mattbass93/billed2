import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile = e => {
    e.preventDefault();

    // Récupérer le fichier téléchargé
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0];

    // Utiliser directement file.name pour récupérer le nom du fichier
    const fileName = file.name;
    const allowedFileTypes = ['image/png', 'image/jpg', 'image/jpeg'];

    // Vérification du type de fichier
    if (!allowedFileTypes.includes(file.type)) {
      alert('Veuillez sélectionner un fichier au format JPG, JPEG ou PNG.');
      e.target.value = '';  // Réinitialiser l'input file
      return;
    }

    // Stocker le nom de fichier et le fichier dans formData
    this.fileName = fileName;
    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append('file', file);
    formData.append('email', email);

    // Stocker temporairement le fichier et ses données dans la classe
    this.formData = formData;
  }


  handleSubmit = e => {
    e.preventDefault();

    const email = JSON.parse(localStorage.getItem("user")).email;

    // Récupérer les champs du formulaire
    const type = e.target.querySelector(`select[data-testid="expense-type"]`).value;
    const name = e.target.querySelector(`input[data-testid="expense-name"]`).value;
    const amount = e.target.querySelector(`input[data-testid="amount"]`).value;
    const date = e.target.querySelector(`input[data-testid="datepicker"]`).value;
    const vat = e.target.querySelector(`input[data-testid="vat"]`).value;
    const pct = e.target.querySelector(`input[data-testid="pct"]`).value || 20;
    const commentary = e.target.querySelector(`textarea[data-testid="commentary"]`).value;

    // Vérifier que tous les champs obligatoires sont remplis, y compris le justificatif
    if (!type || !name || !amount || !date || !vat || !pct || !commentary || !this.formData) {
      alert('Tous les champs obligatoires, y compris le justificatif, doivent être remplis.');
      return; // Arrêter la soumission si un champ ou le fichier est manquant
    }

    this.store
      .bills()
      .create({
        data: this.formData,
        headers: {
          noContentType: true
        }
      })
      .then(({ fileUrl, key }) => {
        this.billId = key;
        this.fileUrl = fileUrl;
        const bill = {
          email,
          type,
          name,
          amount: parseInt(amount),
          date,
          vat,
          pct: parseInt(pct),
          commentary,
          fileUrl: this.fileUrl,
          fileName: this.fileName,
          status: 'pending'
        }
        this.updateBill(bill);
      })
      .catch(error => console.error(error));

    this.onNavigate(ROUTES_PATH['Bills']);
  }



  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills'])
        })
        .catch(error => console.error(error))
    }
  }
}
