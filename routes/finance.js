const express = require('express');
const router = express.Router();
const model = require('../models/finance');
const { verifyToken } = require('../middlewares/authmiddleware'); // optional

//
// ========================= WILAYA =========================
//
router.get('/wilayas', verifyToken, async (req, res) => {
  try {
    const data = await model.getAllWilayas();
    res.json({ success: true, data });
  } catch (err) {
    console.error('❌ Error fetching wilayas:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching wilayas' });
  }
});

router.get('/wilayas/:id', verifyToken, async (req, res) => {
  try {
    const data = await model.getWilayaById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching wilaya', error: err.message });
  }
});

router.post('/wilayas', verifyToken, async (req, res) => {
  try {
    await model.addWilaya(req.body);
    res.json({ success: true, message: 'Wilaya added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding wilaya', error: err.message });
  }
});

router.put('/wilayas/:id', verifyToken, async (req, res) => {
  try {
    await model.updateWilaya(req.params.id, req.body);
    res.json({ success: true, message: 'Wilaya updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating wilaya', error: err.message });
  }
});

router.delete('/wilayas/:id', verifyToken, async (req, res) => {
  try {
    await model.deleteWilaya(req.params.id);
    res.json({ success: true, message: 'Wilaya deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting wilaya', error: err.message });
  }
});

//
// ========================= PROJET =========================
//
router.get('/projets', verifyToken, async (req, res) => {
  try {
    const data = await model.getAllProjets();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching projets', error: err.message });
  }
});

router.get('/projets/:id', verifyToken, async (req, res) => {
  try {
    const data = await model.getProjetById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching projet', error: err.message });
  }
});

router.post('/projets', verifyToken, async (req, res) => {
  try {
    await model.addProjet(req.body);
    res.json({ success: true, message: 'Projet added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding projet', error: err.message });
  }
});

router.put('/projets/:id', verifyToken, async (req, res) => {
  try {
    await model.updateProjet(req.params.id, req.body);
    res.json({ success: true, message: 'Projet updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating projet', error: err.message });
  }
});

router.delete('/projets/:id', verifyToken, async (req, res) => {
  try {
    await model.deleteProjet(req.params.id);
    res.json({ success: true, message: 'Projet deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting projet', error: err.message });
  }
});

//
// ========================= ENTREPRISE =========================
//
router.get('/entreprises', verifyToken, async (req, res) => {
  try {
    const data = await model.getAllEntreprises();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching entreprises', error: err.message });
  }
});

router.get('/entreprises/:id', verifyToken, async (req, res) => {
  try {
    const data = await model.getEntrepriseById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching entreprise', error: err.message });
  }
});

router.post('/entreprises', verifyToken, async (req, res) => {
  try {
    await model.addEntreprise(req.body);
    res.json({ success: true, message: 'Entreprise added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding entreprise', error: err.message });
  }
});

router.put('/entreprises/:id', verifyToken, async (req, res) => {
  try {
    await model.updateEntreprise(req.params.id, req.body);
    res.json({ success: true, message: 'Entreprise updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating entreprise', error: err.message });
  }
});

router.delete('/entreprises/:id', verifyToken, async (req, res) => {
  try {
    await model.deleteEntreprise(req.params.id);
    res.json({ success: true, message: 'Entreprise deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting entreprise', error: err.message });
  }
});

//
// ========================= CONVENTION =========================
//
router.get('/conventions', verifyToken, async (req, res) => {
  try {
    const data = await model.getAllConventions();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching conventions', error: err.message });
  }
});

router.post('/conventions', verifyToken, async (req, res) => {
  try {
    await model.addConvention(req.body);
    res.json({ success: true, message: 'Convention added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding convention', error: err.message });
  }
});

router.put('/conventions/:id', verifyToken, async (req, res) => {
  try {
    await model.updateConvention(req.params.id, req.body);
    res.json({ success: true, message: 'Convention updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating convention', error: err.message });
  }
});

router.delete('/conventions/:id', verifyToken, async (req, res) => {
  try {
    await model.deleteConvention(req.params.id);
    res.json({ success: true, message: 'Convention deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting convention', error: err.message });
  }
});

//
// ========================= REALISATION =========================
//

router.get("/realisations",verifyToken, async (req, res) => {
  try {
    const data = await model.getAllRealisations();
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching réalisations:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

router.get('/realisations/:code_convention', verifyToken, async (req, res) => {
  try {
    const data = await model.getRealisationsByConvention(req.params.code_convention);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching realisations', error: err.message });
  }
});

router.post('/realisations', verifyToken, async (req, res) => {
  try {
    await model.addRealisation(req.body);
    res.json({ success: true, message: 'Réalisation added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding realisation', error: err.message });
  }
});

router.delete('/realisations/:code_convention/:nature_situation', verifyToken, async (req, res) => {
  try {
    await model.deleteRealisation(req.params.code_convention, req.params.nature_situation);
    res.json({ success: true, message: 'Réalisation deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting realisation', error: err.message });
  }
});
router.put("/realisations/:code_convention/:nature_situation",verifyToken, async (req, res) => {
  try {
    await model.updateRealisation(req.params.code_convention, req.params.nature_situation, req.body);
    res.json({ message: "Realisation mise à jour avec succès" });
  } catch (err) {
    console.error("❌ Error updating realisation:", err);
    res.status(500).json({ message: err.message });
  }
});
//
// ========================= ODS =========================
//
router.get('/ods/:code_convention', verifyToken, async (req, res) => {
  try {
    const data = await model.getOdsByConvention(req.params.code_convention);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching ODS', error: err.message });
  }
});

router.post('/ods', verifyToken, async (req, res) => {
  try {
    await model.addOds(req.body);
    res.json({ success: true, message: 'ODS added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding ODS', error: err.message });
  }
});

//
// ========================= AVENANT =========================
//
router.get('/avenants/:code_convention', verifyToken, async (req, res) => {
  try {
    const data = await model.getAvenantsByConvention(req.params.code_convention);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching avenants', error: err.message });
  }
});

router.post('/avenants', verifyToken, async (req, res) => {
  try {
    await model.addAvenant(req.body);
    res.json({ success: true, message: 'Avenant added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding avenant', error: err.message });
  }
});

//
// ========================= DASHBOARD =========================
//
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const data = await model.getDashboardStats();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats', error: err.message });
  }
});

//
// ========================= EXPORT =========================
//
module.exports = router;
