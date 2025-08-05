const express = require('express');
const router = express.Router();
const sousModel = require('../../models/traitement/souscripteurs');
const dossiermodel = require('../../models/traitement/dossier');
const conjointmodel= require('../../models/traitement/conjoint');
const affiliationsmodel=require('../../models/traitement/affiliations');
const controlemodel=require('../../models/traitement/controle_filieres');
const validationmodel=require('../../models/traitement/agent_validations');

const { verifyToken, verifyAccessType2 } = require('../../middlewares/authmiddleware');
const fs = require('fs');
const path = require('path');
const regionsData = require('../../config/regions'); 






router.get('/getsousbyid/:sousId', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const sousId = parseInt(req.params.sousId);

  if (!sousId || !userId) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const [
      souscripteur,
      dossiers,
      dossiersreviews,
      address,
      conjoint,
      affiliations,
      controle,
      motifs
    ] = await Promise.all([
      sousModel.GetSousById(sousId),
      dossiermodel.GetDossierById(sousId),
      dossiermodel.GetDossierStateById(sousId, userId),
      sousModel.GetAddressesBySouscripteurId(sousId),
      conjointmodel.GetConById(sousId),
      affiliationsmodel.GetAffiliationById(sousId),
      controlemodel.GetControleById(sousId),
      controlemodel.GetMotifsBysous(sousId)
    ]);

    return res.json({
      souscripteur,
      dossiers,
      dossiersreviews,
      address,
      conjoint,
      affiliations,
      controle,
      motifs
    });

  } catch (err) {
    console.error('Error retrieving souscripteur data:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

//const BASE_UPLOAD_DIR = path.join(__dirname, 'uploads'); 

const BASE_UPLOAD_DIR = 'D:\\uploads';

router.get('/test-doc/:url', (req, res) => {
  console.log("url is ",BASE_UPLOAD_DIR);
  try {
    const decodedRelativePath = decodeURIComponent(req.params.url);

    // ✅ Prevent path traversal attacks
    const resolvedPath = path.resolve(BASE_UPLOAD_DIR, decodedRelativePath);
    if (!resolvedPath.startsWith(BASE_UPLOAD_DIR)) {
      console.warn('Blocked unauthorized access attempt:', resolvedPath);
      return res.status(400).json({ error: 'Invalid path' });
    }

    // ✅ Check file existence using stat (also gives us metadata)
    fs.stat(resolvedPath, (err, stats) => {
      if (err || !stats.isFile()) {
        console.error('File not found or inaccessible:', resolvedPath);
        return res.status(404).json({ error: 'File not found' });
      }

      // ✅ Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(resolvedPath)}"`);
      res.setHeader('Cache-Control', 'public, max-age=3600');

      // ✅ Stream file (non-blocking, concurrent-friendly)
      const readStream = fs.createReadStream(resolvedPath);

      readStream.on('error', (streamErr) => {
        console.error('Stream error:', streamErr);
        if (!res.headersSent) {
          res.sendStatus(500);
        }
      });

      readStream.pipe(res);
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});




router.post('/insert-dossier-review', verifyToken, async (req, res) => {
  const { souscripteurId, dossierType } = req.body;
  const agentId = req.user.userId; // récupéré depuis verifyToken

  if (!souscripteurId || !dossierType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await dossiermodel.insertDossierReview(souscripteurId, agentId, dossierType);
    res.status(201).json({ message: 'Dossier review inserted successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Review already exists for this dossier' });
    }
    console.error('Insert dossier review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



router.post('/examined', verifyToken, async (req, res) => {
  const { souscripteurId, dossierType } = req.body;
  const agentId = req.user.userId;
  console.log('exxx');

  if (!souscripteurId || !dossierType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await dossiermodel.markDossierExamined(souscripteurId, agentId, dossierType);
    res.status(200).json({ message: 'Dossier marked as examined successfully' });
  } catch (err) {
    console.error('Mark dossier as examined error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/conforme', verifyToken, async (req, res) => {
  const { souscripteurId, dossierType } = req.body;
  const agentId = req.user.userId;

  if (!souscripteurId || !dossierType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await dossiermodel.markDossierConforme(souscripteurId, agentId, dossierType);
    res.status(200).json({ message: 'Dossier marked as conforme successfully' });
  } catch (err) {
    console.error('Mark dossier as conforme error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


/* address endpoints   */



router.post('/addresses', verifyToken, async (req, res) => {
  const { souscripteur_id, commune, wilaya, adresse } = req.body;

  const agent_id = req.user.userId;
  if (!souscripteur_id || !commune || wilaya === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newId = await sousModel.InsertAddress({ souscripteur_id, agent_id, commune, wilaya, adresse });
    res.status(201).json({ success: true, id: newId });
  } catch (error) {
    console.error('InsertAddress Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});




router.get('/addresses/:souscripteurId', verifyToken, async (req, res) => {
  const { souscripteurId } = req.params;

  try {
    const addresses = await sousModel.GetAddressesBySouscripteurId(souscripteurId);
    res.json({ success: true, addresses });
  } catch (error) {
    console.error('GetAddresses Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});



router.get('/stats', verifyToken, async (req, res) => {
  try {
    const stats = await sousModel.getSouscripteurStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('getSouscripteurStats error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/stats/traite-par-jour', async (req, res) => {
  try {
    const data = await sousModel.getTraitesParJourDerniers10Jours();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});



router.get('/validations', verifyToken, async (req, res) => {

  try {
 if (req.user?.userRole !== 'membre') {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const decision = req.query.decision || '';
    const dr = req.user?.userDr;
    const limit = parseInt(req.query.limit || '10', 10);
    const offset = parseInt(req.query.offset || '0', 10);
  console.log(req.user?.userRole,dr );
    if (!decision || isNaN(dr)) {
      return res.status(400).json({ success: false, message: 'decision et dr (entier) requis' });
    }

    const data = await new Promise((resolve, reject) => {
      validationmodel.getValidationsPaginated(decision, dr, limit, offset, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('getValidationsPaginated error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});



router.post('/validations/bulk', verifyToken, async (req, res) => {
  if (req.user?.userRole !== 'membre') {
    return res.status(403).json({ success: false, message: 'Accès refusé' });
  }

  const membreId = req.user?.userId;
  const { decisions } = req.body;

  if (!Array.isArray(decisions) || decisions.length === 0) {
    return res.status(400).json({ success: false, message: 'Aucune décision fournie.' });
  }

  // Prepare data for update
  const formatted = decisions.map(({ souscripteurId, decision, motif }) => ({
    souscripteurId,
    membreId,
    decision,
    motif: motif || null,
  }));

  try {
    await new Promise((resolve, reject) => {
      validationmodel.updateValidationDecision(formatted, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    return res.status(200).json({ success: true, message: 'Décisions mises à jour avec succès.' });
  } catch (error) {
    console.error('Erreur updateValidationDecision:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});



router.post('/insertToComplete', verifyToken, (req, res) => {
  const { souscripteurId, dossier } = req.body;

  if (!souscripteurId || !dossier) {
    return res.status(400).json({ error: 'souscripteurId et dossier sont requis.' });
  }
validationmodel.insertToComplete(souscripteurId, dossier, (err, result) => {
    if (err) {
      console.error('Erreur lors de l’insertion dans complete :', err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }

    res.status(201).json({ message: 'Insertion réussie', data: result });
  });
});




module.exports = router;