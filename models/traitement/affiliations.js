const { promise: db } = require('../../config/db');

// ========================= WILAYA =========================
async function getAllWilayas() {
  const [rows] = await db.query(`SELECT * FROM wilaya ORDER BY nom`);
  return rows;
}

async function getWilayaById(id) {
  const [rows] = await db.query(`SELECT * FROM wilaya WHERE id_wilaya = ?`, [id]);
  return rows[0] || null;
}

async function addWilaya(data) {
  const { nom, code } = data;
  await db.query(`INSERT INTO wilaya (nom, code) VALUES (?, ?)`, [nom, code]);
}

async function updateWilaya(id, data) {
  const { nom, code } = data;
  await db.query(`UPDATE wilaya SET nom = ?, code = ? WHERE id_wilaya = ?`, [nom, code, id]);
}

async function deleteWilaya(id) {
  await db.query(`DELETE FROM wilaya WHERE id_wilaya = ?`, [id]);
}

// ========================= PROJET =========================
async function getAllProjets() {
  const [rows] = await db.query(`
    SELECT p.*, w.nom AS wilaya_nom 
    FROM projet p
    JOIN wilaya w ON p.wilaya_id = w.id_wilaya
  `);
  return rows;
}

async function getProjetById(id) {
  const [rows] = await db.query(`SELECT * FROM projet WHERE id_projet = ?`, [id]);
  return rows[0] || null;
}

async function addProjet(data) {
  const { nom, localisation, wilaya_id, superficie, statut } = data;
  await db.query(
    `INSERT INTO projet (nom, localisation, wilaya_id, superficie, statut) VALUES (?, ?, ?, ?, ?)`,
    [nom, localisation, wilaya_id, superficie, statut]
  );
}

async function updateProjet(id, data) {
  const { nom, localisation, wilaya_id, superficie, statut } = data;
  await db.query(
    `UPDATE projet SET nom = ?, localisation = ?, wilaya_id = ?, superficie = ?, statut = ? WHERE id_projet = ?`,
    [nom, localisation, wilaya_id, superficie, statut, id]
  );
}

async function deleteProjet(id) {
  await db.query(`DELETE FROM projet WHERE id_projet = ?`, [id]);
}

// ========================= TRANCHE =========================
async function getAllTranches() {
  const [rows] = await db.query(`
    SELECT t.*, p.nom AS projet_nom 
    FROM tranche t 
    JOIN projet p ON t.projet_id = p.id_projet
  `);
  return rows;
}

async function addTranche(data) {
  const { projet_id, numero, description } = data;
  await db.query(`INSERT INTO tranche (projet_id, numero, description) VALUES (?, ?, ?)`, [projet_id, numero, description]);
}

// ========================= BUDGET =========================
async function getAllBudgets() {
  const [rows] = await db.query(`SELECT * FROM budget ORDER BY type`);
  return rows;
}

async function addBudget(data) {
  const { type, description } = data;
  await db.query(`INSERT INTO budget (type, description) VALUES (?, ?)`, [type, description]);
}

// ========================= FINANCEMENT =========================
async function getFinancementByTranche(tranche_id) {
  const [rows] = await db.query(`
    SELECT f.*, b.type AS budget_type
    FROM financement f
    JOIN budget b ON f.budget_id = b.id_budget
    WHERE tranche_id = ?
  `, [tranche_id]);
  return rows;
}

async function addFinancement(data) {
  const { tranche_id, budget_id, montant_prevu } = data;
  await db.query(
    `INSERT INTO financement (tranche_id, budget_id, montant_prevu) VALUES (?, ?, ?)`,
    [tranche_id, budget_id, montant_prevu]
  );
}

// ========================= DEPENSE =========================
async function getDepensesByProjet(projet_id) {
  const [rows] = await db.query(`
    SELECT d.*, f.montant_prevu, b.type AS budget_type
    FROM depense d
    JOIN financement f ON d.financement_id = f.id_financement
    JOIN budget b ON f.budget_id = b.id_budget
    WHERE d.projet_id = ?
  `, [projet_id]);
  return rows;
}

async function addDepense(data) {
  const { financement_id, projet_id, montant, date_depense, type } = data;
  await db.query(
    `INSERT INTO depense (financement_id, projet_id, montant, date_depense, type) VALUES (?, ?, ?, ?, ?)`,
    [financement_id, projet_id, montant, date_depense, type]
  );
}

// ========================= DOCUMENT =========================
async function getDocumentsByDepense(depense_id) {
  const [rows] = await db.query(`SELECT * FROM document WHERE depense_id = ?`, [depense_id]);
  return rows;
}

async function addDocument(data) {
  const { depense_id, type, file_path } = data;
  await db.query(`INSERT INTO document (depense_id, type, file_path) VALUES (?, ?, ?)`, [depense_id, type, file_path]);
}

// ========================= ENTREPRISE =========================
async function getAllEntreprises() {
  const [rows] = await db.query(`SELECT * FROM entreprise ORDER BY nom`);
  return rows;
}

async function addEntreprise(data) {
  const { nom, rc, type, contact } = data;
  await db.query(`INSERT INTO entreprise (nom, rc, type, contact) VALUES (?, ?, ?, ?)`, [nom, rc, type, contact]);
}

// ========================= UTILISATEUR =========================
async function getAllUsers() {
  const [rows] = await db.query(`SELECT id, nom, email, role, wilaya_id FROM utilisateur`);
  return rows;
}

async function addUser(data) {
  const { nom, email, password, role, wilaya_id } = data;
  await db.query(
    `INSERT INTO utilisateur (nom, email, password, role, wilaya_id) VALUES (?, ?, ?, ?, ?)`,
    [nom, email, password, role, wilaya_id]
  );
}

// ========================= DASHBOARD =========================
async function getDashboardStats() {
  const [rows] = await db.query(`
    SELECT 
      (SELECT COUNT(*) FROM projet) AS total_projets,
      (SELECT SUM(montant_prevu) FROM financement) AS total_prevu,
      (SELECT SUM(montant) FROM depense) AS total_depense,
      (SELECT COUNT(*) FROM entreprise) AS total_entreprises
  `);
  return rows[0];
}

// ==============================================================
module.exports = {
  // Wilaya
  getAllWilayas, getWilayaById, addWilaya, updateWilaya, deleteWilaya,
  // Projet
  getAllProjets, getProjetById, addProjet, updateProjet, deleteProjet,
  // Tranche
  getAllTranches, addTranche,
  // Budget
  getAllBudgets, addBudget,
  // Financement
  getFinancementByTranche, addFinancement,
  // Dépense
  getDepensesByProjet, addDepense,
  // Document
  getDocumentsByDepense, addDocument,
  // Entreprise
  getAllEntreprises, addEntreprise,
  // Utilisateur
  getAllUsers, addUser,
  // Dashboard
  getDashboardStats,
};
