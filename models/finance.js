const { promise: db } = require('../config/db');

//
// ========================= WILAYA =========================
//
async function getAllWilayas(dr) {
  let query = `SELECT * FROM wilaya`;
  const params = [];

  if (dr && dr !== 0) {
    query += ` WHERE dr = ?`;
    params.push(dr);
  }

  query += ` ORDER BY nom_wilaya`;

  const [rows] = await db.query(query, params);
  return rows;
}


async function getWilayaById(id) {
  const [rows] = await db.query(`SELECT * FROM wilaya WHERE id_wilaya = ?`, [id]);
  return rows[0] || null;
}

async function addWilaya(data) {
  const { nom_wilaya } = data;
  await db.query(`INSERT INTO wilaya (nom_wilaya) VALUES (?)`, [nom_wilaya]);
}

async function updateWilaya(id, data) {
  const { nom_wilaya } = data;
  await db.query(`UPDATE wilaya SET nom_wilaya = ? WHERE id_wilaya = ?`, [nom_wilaya, id]);
}

async function deleteWilaya(id) {
  await db.query(`DELETE FROM wilaya WHERE id_wilaya = ?`, [id]);
}

async function getAllDrOfWilaya(wilaya_id) {
  const [rows] = await db.query(`SELECT dr FROM wilaya where code_wilaya= ?`,[wilaya_id]);
  return rows[0];
}

//
// ========================= PROJET =========================
//
async function getAllProjets(dr) {
  

  let query = `
    SELECT p.*, w.nom_wilaya
    FROM projet p
    LEFT JOIN wilaya w ON p.id_wilaya = w.id_wilaya

    
  `;
  const params = [];

  if(dr && dr !== 0) {   
   query += ` WHERE w.dr = ? `;
   params.push(dr);

  }

  const [rows] = await db.query(query, params);
  return rows;
}

async function getProjetById(id) {
  const [rows] = await db.query(`
    SELECT p.*, w.nom_wilaya 
    FROM projet p 
    LEFT JOIN wilaya w ON p.id_wilaya = w.id_wilaya 
    WHERE id_projet = ?
  `, [id]);
  return rows[0] || null;
}

async function addProjet(data) {
  const { nom_projet, localisation, id_wilaya, superficie, nbr_logements, date_lancement, statut, observation } = data;
  await db.query(`
    INSERT INTO projet (nom_projet, localisation, id_wilaya, superficie, nbr_logements, observation)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [nom_projet, localisation, id_wilaya, superficie, nbr_logements, observation]);
}

async function updateProjet(id, data) {
  const { nom_projet, localisation, id_wilaya, superficie, nbr_logements, date_lancement, statut, observation } = data;
  await db.query(`
    UPDATE projet 
    SET nom_projet=?, localisation=?, id_wilaya=?, superficie=?, nbr_logements=?, date_lancement=?, statut=?, observation=? 
    WHERE id_projet=?
  `, [nom_projet, localisation, id_wilaya, superficie, nbr_logements, date_lancement, statut, observation, id]);
}

async function deleteProjet(id) {
  await db.query(`DELETE FROM projet WHERE id_projet = ?`, [id]);
}

//
// ========================= ENTREPRISE =========================
//
async function getAllEntreprises() {
  const [rows] = await db.query(`SELECT * FROM entreprise ORDER BY nom_entreprise`);
  return rows;
}

async function getEntrepriseById(id) {
  const [rows] = await db.query(`SELECT * FROM entreprise WHERE id_entreprise = ?`, [id]);
  return rows[0] || null;
}

async function addEntreprise(data) {
  const { nom_entreprise, type_entreprise, rc, nif, adresse, contact } = data;
  await db.query(`
    INSERT INTO entreprise (nom_entreprise, type_entreprise, rc, nif, adresse, contact)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [nom_entreprise, type_entreprise, rc, nif, adresse, contact]);
}

async function updateEntreprise(id, data) {
  const { nom_entreprise, type_entreprise, rc, nif, adresse, contact } = data;
  await db.query(`
    UPDATE entreprise
    SET nom_entreprise=?, type_entreprise=?, rc=?, nif=?, adresse=?, contact=?
    WHERE id_entreprise=?
  `, [nom_entreprise, type_entreprise, rc, nif, adresse, contact, id]);
}

async function deleteEntreprise(id) {
  await db.query(`DELETE FROM entreprise WHERE id_entreprise=?`, [id]);
}

//
// ========================= CONVENTION =========================
//
async function getAllConventions(dr) {
  let query = `
    SELECT 
      c.*, 
      p.nom_projet, 
      e.nom_entreprise,
      w.nom_wilaya,
      w.dr
    FROM convention c
    JOIN projet p ON c.id_projet = p.id_projet
    JOIN entreprise e ON c.id_entreprise = e.id_entreprise
    JOIN wilaya w ON p.id_wilaya = w.code_wilaya
  `;

  const params = [];

  if (dr && dr !== 0) {  
    query += ` WHERE w.dr = ? `;
    params.push(dr);
  }

  query += ` ORDER BY c.code_convention DESC`;

  const [rows] = await db.query(query, params);
  return rows;
}


// addConvention - improved with try/catch + debug logging + return inserted id
async function addConvention(data) {
  const {
    code_convention,
    id_projet,
    id_entreprise,
    type_rubrique,
    ap_projet,
    ap_logt,
    ap_vrd,
    remuneration_aadl,
    remuneration_bnh,
    frais_gestion,
    delai_realisation,
    montant_initial,
    date_demarrage,
    is_resilie,
    date_resiliation
  } = data;

  // Basic validation (optional but helpful)
  if (!id_projet || !id_entreprise  || !code_convention) {
    throw new Error("Validation error: id_projet and id_entreprise are required.");
  }

  const sql = `
    INSERT INTO convention (
    code_convention,id_projet, id_entreprise, type_rubrique, ap_projet, ap_logt, ap_vrd,
      remuneration_aadl, remuneration_bnh, frais_gestion, delai_realisation,
      montant_initial, date_demarrage, is_resilie, date_resiliation
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    code_convention,
    id_projet,
    id_entreprise,
    type_rubrique || 'autre',
    ap_projet || 0,
    ap_logt || 0,
    ap_vrd || 0,
    remuneration_aadl || 0,
    remuneration_bnh || 0,
    frais_gestion || 0,
    delai_realisation || null,
    montant_initial || null,
    date_demarrage || null,
    // Convert boolean-ish values to 0/1 if needed
    (typeof is_resilie === 'boolean') ? (is_resilie ? 1 : 0) : (is_resilie == 1 ? 1 : 0),
    date_resiliation || null
  ];

  try {
    console.log("SQL -> addConvention:", sql);
    console.log("Params -> addConvention:", params);

    const [result] = await db.query(sql, params);

    // result.insertId available on success
    return { success: true, insertedId: result.insertId };
  } catch (err) {
    // Log full error server-side
    console.error("❌ addConvention error:", err);
    // Re-throw so caller (route) can catch and return appropriate response
    throw err;
  }
}


async function updateConvention(id, data) {
  const {code_convention,
    id_projet, id_entreprise, type_rubrique, ap_projet, ap_logt, ap_vrd,
    remuneration_aadl, remuneration_bnh, frais_gestion, delai_realisation,
    montant_initial, date_demarrage, is_resilie, date_resiliation
  } = data;

  await db.query(`
    UPDATE convention
    SET code_convention= ?, id_projet=?, id_entreprise=?, type_rubrique=?, ap_projet=?, ap_logt=?, ap_vrd=?,
        remuneration_aadl=?, remuneration_bnh=?, frais_gestion=?, delai_realisation=?, 
        montant_initial=?, date_demarrage=?, is_resilie=?, date_resiliation=?
    WHERE code_convention=?
  `, [
    code_convention,id_projet, id_entreprise, type_rubrique, ap_projet, ap_logt, ap_vrd,
    remuneration_aadl, remuneration_bnh, frais_gestion, delai_realisation,
    montant_initial, date_demarrage, is_resilie, date_resiliation, id
  ]);
}

async function deleteConvention(id) {
  await db.query(`DELETE FROM convention WHERE code_convention=?`, [id]);
}

//
// ========================= REALISATION =========================
//

// ========================= REALISATION - GET ALL =========================
async function getAllRealisations(dr) {
  let query = `
    SELECT 
      r.*, 
      c.code_convention,
      c.type_rubrique,
      p.nom_projet,
      e.nom_entreprise,
      w.nom_wilaya,
      w.dr
    FROM realisation r
    JOIN convention c ON r.code_convention = c.code_convention
    JOIN projet p ON c.id_projet = p.id_projet
    JOIN entreprise e ON c.id_entreprise = e.id_entreprise
    JOIN wilaya w ON p.id_wilaya = w.code_wilaya
  `;

  const params = [];

  if (dr && dr !== 0) {
    query += ` WHERE w.dr = ?`;
    params.push(dr);
  }

  query += ` ORDER BY c.code_convention DESC`;

  const [rows] = await db.query(query, params);
  return rows;
}



async function getRealisationsByConvention(code_convention) {
  const [rows] = await db.query(`
    SELECT * FROM realisation WHERE code_convention = ? ORDER BY date_arret_situation DESC
  `, [code_convention]);
  return rows;
}

async function addRealisation(data) {
  const {
    code_convention,
    nature_situation,
    montant_engage,
    montant_net_ttc,
    montant_net_ht,
    montant_paye_bnh,
    date_arret_situation,
    date_depot_entreprise,
    date_depot_bnh,
    consommation_moy_mensuelle,
    taux_consommation_mensuel,
    observation
  } = data;

  await db.query(`
    INSERT INTO realisation (
      code_convention, nature_situation, montant_engage, montant_net_ttc, montant_net_ht,
      montant_paye_bnh, date_arret_situation, date_depot_entreprise, date_depot_bnh,
      consommation_moy_mensuelle, taux_consommation_mensuel, observation
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    code_convention, nature_situation, montant_engage, montant_net_ttc, montant_net_ht,
    montant_paye_bnh, date_arret_situation, date_depot_entreprise, date_depot_bnh,
    consommation_moy_mensuelle, taux_consommation_mensuel, observation
  ]);
}

async function deleteRealisation(code_convention, nature_situation) {
  await db.query(`
    DELETE FROM realisation WHERE code_convention = ? AND nature_situation = ?
  `, [code_convention, nature_situation]);
}


async function updateRealisation(code_convention, nature_situation, data) {
  const {
    montant_engage,
    montant_net_ttc,
    montant_net_ht,
    montant_paye_bnh,
    date_arret_situation,
    date_depot_entreprise,
    date_depot_bnh,
    consommation_moy_mensuelle,
    taux_consommation_mensuel,
    observation
  } = data;

  await db.query(`
    UPDATE realisation
    SET 
      montant_engage = ?,
      montant_net_ttc = ?,
      montant_net_ht = ?,
      montant_paye_bnh = ?,
      date_arret_situation = ?,
      date_depot_entreprise = ?,
      date_depot_bnh = ?,
      consommation_moy_mensuelle = ?,
      taux_consommation_mensuel = ?,
      observation = ?
    WHERE code_convention = ? AND nature_situation = ?
  `, [
    montant_engage,
    montant_net_ttc,
    montant_net_ht,
    montant_paye_bnh,
    date_arret_situation,
    date_depot_entreprise,
    date_depot_bnh,
    consommation_moy_mensuelle,
    taux_consommation_mensuel,
    observation,
    code_convention,
    nature_situation
  ]);
}


//
// ========================= ODS =========================
//
async function getOdsByConvention(code_convention) {
  const [rows] = await db.query(`
    SELECT * FROM ods WHERE code_convention = ? ORDER BY date_ods DESC
  `, [code_convention]);
  return rows;
}

async function addOds(data) {
  const { code_convention, description, date_ods } = data;
  await db.query(`
    INSERT INTO ods (code_convention, description, date_ods)
    VALUES (?, ?, ?)
  `, [code_convention, description, date_ods]);
}

//
// ========================= AVENANT =========================
//
async function getAvenantsByConvention(code_convention) {
  const [rows] = await db.query(`
    SELECT a.*, o.description AS ods_description
    FROM avenant a
    LEFT JOIN ods o ON a.code_ods = o.code_ods
    WHERE a.code_convention = ?
  `, [code_convention]);
  return rows;
}

async function addAvenant(data) {
  const { code_convention, code_ods, montant_avenant, description } = data;
  await db.query(`
    INSERT INTO avenant (code_convention, code_ods, montant_avenant, description)
    VALUES (?, ?, ?, ?)
  `, [code_convention, code_ods, montant_avenant, description]);
}

//
// ========================= DASHBOARD =========================
/*
async function getDashboardStats() {
  const [rows] = await db.query(`
    SELECT 
      (SELECT COUNT(*) FROM projet) AS total_projets,
      (SELECT COUNT(*) FROM entreprise) AS total_entreprises,
      (SELECT COUNT(*) FROM convention) AS total_conventions,
      (SELECT SUM(montant_paye_bnh) FROM realisation) AS total_paye_bnh,
      (SELECT SUM(montant_initial) FROM convention) AS total_montant_initial
  `);
  return rows[0];
}
*/



async function getRecapData(dr) {
  let query = `
    SELECT
      w.id_wilaya AS indic_wilaya,
      w.nom_wilaya AS wilaya,
      p.id_projet AS code_projet,
      p.nom_projet,
      p.localisation,

      -- AP prévus
      SUM(c.ap_logt) AS ap_logement,
      SUM(c.ap_vrd) AS ap_vrd,

      -- Engagements cumulés
      SUM(CASE WHEN c.type_rubrique = 'logement' THEN r.montant_engage ELSE 0 END) AS engagement_logement,
      SUM(CASE WHEN c.type_rubrique = 'vrd' THEN r.montant_engage ELSE 0 END) AS engagement_vrd,

      -- Paiements cumulés
      SUM(CASE WHEN c.type_rubrique = 'logement' THEN r.total_paiement ELSE 0 END) AS paiement_logement,
      SUM(CASE WHEN c.type_rubrique = 'vrd' THEN r.total_paiement ELSE 0 END) AS paiement_vrd,

      -- Paiements de l’exercice ANTERIEUR
      SUM(CASE WHEN c.type_rubrique = 'logement' THEN r.paiement_exercice_anterieur ELSE 0 END) AS paiement_exercice_anterieur_logement,
      SUM(CASE WHEN c.type_rubrique = 'vrd' THEN r.paiement_exercice_anterieur ELSE 0 END) AS paiement_exercice_anterieur_vrd,

      -- Paiements de l’exercice du MOIS
      SUM(CASE WHEN c.type_rubrique = 'logement' THEN r.paiement_exercice_mois ELSE 0 END) AS paiement_exercice_mois_logement,
      SUM(CASE WHEN c.type_rubrique = 'vrd' THEN r.paiement_exercice_mois ELSE 0 END) AS paiement_exercice_mois_vrd,

      -- Totaux dérivés
      (SUM(c.ap_logt + c.ap_vrd) - SUM(r.total_paiement)) AS solde_ap_paiement,
      (SUM(c.ap_logt + c.ap_vrd) - SUM(r.montant_engage)) AS solde_ap_engagement,

      -- Taux
      ROUND((SUM(r.montant_engage) / NULLIF(SUM(c.ap_logt + c.ap_vrd), 0)) * 100, 2) AS taux_engagement,
      ROUND((SUM(r.total_paiement) / NULLIF(SUM(c.ap_logt + c.ap_vrd), 0)) * 100, 2) AS taux_paiement,

  
      SUM(r.total_paiement) AS Paiement_Cumule

       
    FROM projet p
    LEFT JOIN wilaya w ON w.id_wilaya = p.id_wilaya
    LEFT JOIN convention c ON c.id_projet = p.id_projet
    LEFT JOIN (
        SELECT
          code_convention,
          SUM(montant_engage) AS montant_engage,
          SUM(montant_paye_bnh) AS total_paiement,

          -- Paiement exercice antérieur (avant le mois courant)
          SUM(
            CASE 
              WHEN YEAR(date_arret_situation) = YEAR(CURDATE()) 
                AND MONTH(date_arret_situation) < MONTH(CURDATE()) 
              THEN montant_paye_bnh ELSE 0 
            END
          ) AS paiement_exercice_anterieur,

          -- Paiement exercice du mois courant
          SUM(
            CASE 
              WHEN YEAR(date_arret_situation) = YEAR(CURDATE()) 
                AND MONTH(date_arret_situation) = MONTH(CURDATE()) 
              THEN montant_paye_bnh ELSE 0 
            END
          ) AS paiement_exercice_mois

        FROM realisation
        GROUP BY code_convention
    ) r ON r.code_convention = c.code_convention
  `;

  const params = [];

  if (dr && dr !== 0) {
    query += ` WHERE w.dr = ?`;
    params.push(dr);
  }

  query += `
    GROUP BY w.id_wilaya, p.id_projet
    ORDER BY w.nom_wilaya, p.nom_projet
  `;

  const [rows] = await db.query(query, params);
  return rows;
}


async function getDashboardStats(dr) {
  let query = `
    SELECT 
      -- Total counts
      (SELECT COUNT(*) FROM projet p 
        JOIN wilaya w ON p.id_wilaya = w.code_wilaya
        ${dr && dr !== 0 ? 'WHERE w.dr = ?' : ''}) AS total_projets,

      (SELECT COUNT(*) FROM entreprise) AS total_entreprises,

      (SELECT COUNT(*) FROM convention c
        JOIN projet p ON c.id_projet = p.id_projet
        JOIN wilaya w ON p.id_wilaya = w.code_wilaya
        ${dr && dr !== 0 ? 'WHERE w.dr = ?' : ''}) AS total_conventions,

      (SELECT COUNT(*) FROM ods o
        JOIN convention c ON o.code_convention = c.code_convention
        JOIN projet p ON c.id_projet = p.id_projet
        JOIN wilaya w ON p.id_wilaya = w.code_wilaya
        ${dr && dr !== 0 ? 'WHERE w.dr = ?' : ''}) AS total_ods,

      (SELECT COUNT(*) FROM avenant a
        JOIN convention c ON a.code_convention = c.code_convention
        JOIN projet p ON c.id_projet = p.id_projet
        JOIN wilaya w ON p.id_wilaya = w.code_wilaya
        ${dr && dr !== 0 ? 'WHERE w.dr = ?' : ''}) AS total_avenants,

      -- Financial totals
      (SELECT SUM(montant_initial) 
        FROM convention c
        JOIN projet p ON c.id_projet = p.id_projet
        JOIN wilaya w ON p.id_wilaya = w.code_wilaya
        ${dr && dr !== 0 ? 'WHERE w.dr = ?' : ''}) AS montant_total_initial,

      (SELECT SUM(r.montant_paye_bnh)
        FROM realisation r
        JOIN convention c ON r.code_convention = c.code_convention
        JOIN projet p ON c.id_projet = p.id_projet
        JOIN wilaya w ON p.id_wilaya = w.code_wilaya
        ${dr && dr !== 0 ? 'WHERE w.dr = ?' : ''}) AS montant_total_realise,

      -- Execution rate (%)
      ROUND((
        (SELECT SUM(r.montant_paye_bnh)
          FROM realisation r
          JOIN convention c ON r.code_convention = c.code_convention
          JOIN projet p ON c.id_projet = p.id_projet
          JOIN wilaya w ON p.id_wilaya = w.code_wilaya
          ${dr && dr !== 0 ? 'WHERE w.dr = ?' : ''})
        /
        NULLIF(
          (SELECT SUM(c.montant_initial)
            FROM convention c
            JOIN projet p ON c.id_projet = p.id_projet
            JOIN wilaya w ON p.id_wilaya = w.code_wilaya
            ${dr && dr !== 0 ? 'WHERE w.dr = ?' : ''}),
        0)
      ) * 100, 2) AS taux_execution_global,

      -- Completed projects (example: statut = 'achevé')
      (SELECT COUNT(*) FROM projet p
        JOIN wilaya w ON p.id_wilaya = w.code_wilaya
        ${dr && dr !== 0 ? "WHERE w.dr = ? AND p.statut = 'achevé'" : "WHERE p.statut = 'achevé'"}) AS projets_acheves
  `;

  // Collect parameters (each ? needs one dr value)
  const params = dr && dr !== 0
    ? [dr, dr, dr, dr, dr, dr, dr, dr, dr, dr]  // one per ?
    : [];

  const [rows] = await db.query(query, params);
  return rows[0];
}


//
// ========================= EXPORT =========================
//
module.exports = {
  // Wilaya
  getAllWilayas, getWilayaById, addWilaya, updateWilaya, deleteWilaya,getAllDrOfWilaya,
  // Projet
  getAllProjets, getProjetById, addProjet, updateProjet, deleteProjet,
  // Entreprise
  getAllEntreprises, getEntrepriseById, addEntreprise, updateEntreprise, deleteEntreprise,
  // Convention
  getAllConventions, addConvention, updateConvention, deleteConvention,
  // Réalisation
  getRealisationsByConvention, addRealisation, deleteRealisation,getAllRealisations,updateRealisation,
  // ODS
  getOdsByConvention, addOds,
  // Avenant
  getAvenantsByConvention, addAvenant,
  // Dashboard
  getDashboardStats,
  getRecapData
};
