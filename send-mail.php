<?php
/**
 * TOPO SABUGNOUMA WASSA (TSW) — Script de traitement du formulaire de contact / devis
 * Hébergement : Hostinger
 * Solution : Hybride (Envoi e-mail serveur PHP + relais WhatsApp client)
 */

// En-têtes JSON et encodage UTF-8
header('Content-Type: application/json; charset=utf-8');

// Autoriser les requêtes POST uniquement
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée. Seules les requêtes POST sont acceptées.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ============================================================
// CONFIGURATION DE RÉCEPTION (HOSTINGER)
// ============================================================
// Adresse e-mail où vous souhaitez recevoir les demandes de devis :
$to = "contact@tsw-topo.com";

// Adresse e-mail de copie facultative (laisser vide si non utilisée) :
$cc = ""; // Ex: "toposabugnoumawassa@gmail.com"

// Nom d'expéditeur affiché dans votre boîte de messagerie
$from_name = "Site Web TSW";
$from_email = "noreply@" . (isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'tsw-topo.com');

// ============================================================
// PROTECTION ANTI-SPAM (HONEYPOT)
// ============================================================
// Si le champ piège 'website' est rempli par un robot, on simule le succès
if (!empty($_POST['website'])) {
    echo json_encode([
        'success' => true,
        'message' => 'Votre demande a bien été reçue.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ============================================================
// RÉCUPÉRATION ET ASSAINISSEMENT DES DONNÉES
// ============================================================
function clean_input($data) {
    if (!isset($data)) return '';
    return htmlspecialchars(trim(strip_tags($data)), ENT_QUOTES, 'UTF-8');
}

$form_source  = clean_input($_POST['form_source'] ?? 'contact');
$is_immo      = ($form_source === 'immobilier' || !empty($_POST['type_demande']));

$nom          = clean_input($_POST['nom'] ?? '');
$telephone    = clean_input($_POST['telephone'] ?? '');
$email        = clean_input($_POST['email'] ?? '');
$type_demande = clean_input($_POST['type_demande'] ?? '');
$zone         = clean_input($_POST['zone'] ?? '');
$prestation_k = clean_input($_POST['prestation'] ?? '');
$localisation = clean_input($_POST['localisation'] ?? '');
$besoin       = clean_input($_POST['besoin'] ?? $_POST['message'] ?? '');
$delai_k      = clean_input($_POST['delai'] ?? '');

// Validation des champs obligatoires
$errors = [];

if (empty($nom) || mb_strlen($nom) < 2) {
    $errors[] = "Le nom ou la raison sociale est obligatoire.";
}

if (empty($telephone) || mb_strlen($telephone) < 8) {
    $errors[] = "Un numéro de téléphone valide est obligatoire.";
}

if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "L'adresse e-mail renseignée n'est pas valide.";
}

if ($is_immo) {
    if (empty($type_demande)) {
        $errors[] = "Veuillez sélectionner le type de demande (Achat ou Vente).";
    }
    if (empty($zone)) {
        $errors[] = "Veuillez sélectionner une des 3 zones d'intervention.";
    }
    if (empty($besoin) || mb_strlen($besoin) < 10) {
        $errors[] = "Veuillez préciser la description de votre besoin immobilier (minimum 10 caractères).";
    }
} else {
    if (empty($prestation_k)) {
        $errors[] = "Veuillez sélectionner un type de prestation.";
    }
    if (empty($localisation)) {
        $errors[] = "La localisation géographique du projet est obligatoire.";
    }
    if (empty($besoin) || mb_strlen($besoin) < 10) {
        $errors[] = "Veuillez préciser la description de votre projet (minimum 10 caractères).";
    }
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'errors'  => $errors,
        'message' => implode(' ', $errors)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Correspondance des libellés de prestations
$prestations_map = [
    'topographie'  => 'Levé topographique de terrain',
    'foncier'      => 'Relevé de parcelle / Étude foncière / Bornage',
    'cartographie' => 'Cartographie technique ou thématique',
    'sig'          => 'Système d\'information géographique (SIG)',
    'geodesie'     => 'Positionnement GNSS / Rattachement géodésique',
    'photo'        => 'Photogrammétrie / Imagerie drone',
    'chantier'     => 'Implantation ou suivi de chantier BTP',
    'amenagement'  => 'Plan de lotissement / Aménagement',
    'conseil'      => 'Conseil technique / Audit de dossier foncier',
    'autre'        => 'Autre besoin spécifique'
];
$prestation_libelle = $prestations_map[$prestation_k] ?? $prestation_k;

// Type de demande immobilière
$type_immo_libelle = ($type_demande === 'achat' ? 'Achat de parcelle' : ($type_demande === 'vente' ? 'Vente de parcelle' : $type_demande));

// Correspondance des délais
$delais_map = [
    'urgent'  => 'Urgent (dans les 48 heures)',
    'semaine' => 'Dans la semaine',
    'mois'    => 'Dans le mois',
    'etude'   => 'En phase d\'étude préliminaire'
];
$delai_libelle = $delais_map[$delai_k] ?? ($delai_k ? $delai_k : 'Non précisé');

// Date et métadonnées
$date_envoi = date('d/m/Y à H:i') . ' (GMT)';
$ip_client  = $_SERVER['REMOTE_ADDR'] ?? 'Non déterminée';

// ============================================================
// COMPOSITION DU SUJET ET DU CORPS DU COURRIEL (HTML & TEXTE)
// ============================================================
if ($is_immo) {
    $subject = "=?UTF-8?B?" . base64_encode("Demande Immobilière TSW : {$type_immo_libelle} [{$zone}] - {$nom}") . "?=";
} else {
    $subject = "=?UTF-8?B?" . base64_encode("Nouvelle demande de devis : {$prestation_libelle} - {$nom}") . "?=";
}

// Template HTML
$email_html = "
<!DOCTYPE html>
<html lang='fr'>
<head>
<meta charset='UTF-8'>
<title>Demande de devis TSW</title>
</head>
<body style='margin:0; padding:20px; font-family:Arial, sans-serif; background-color:#f4f6fa; color:#2c3e50;'>
  <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='max-width:640px; margin:0 auto; background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.08); border:1px solid #e1e8f0;'>
    
    <!-- En-tête TSW -->
    <tr>
      <td style='background:linear-gradient(135deg, #102d70 0%, #0d2358 100%); padding:28px 24px; text-align:center;'>
        <h1 style='margin:0; font-size:22px; font-weight:800; color:#ffffff; letter-spacing:0.5px;'>TOPO SABUGNOUMA WASSA</h1>
        <div style='margin-top:6px; font-size:13px; color:#159447; font-weight:700; text-transform:uppercase; letter-spacing:1px;'>Ingénierie Géomatique, Topographie & Transactions Foncières</div>
        <div style='margin-top:14px; display:inline-block; background:rgba(255,255,255,0.15); color:#ffffff; padding:6px 14px; border-radius:20px; font-size:12px; font-weight:600;'>
          " . ($is_immo ? "DEMANDE IMMOBILIÈRE (ACHAT / VENTE)" : "NOUVELLE DEMANDE DE DEVIS") . "
        </div>
      </td>
    </tr>

    <!-- Corps -->
    <tr>
      <td style='padding:28px 24px;'>
        <p style='margin-top:0; font-size:15px; line-height:1.6; color:#334155;'>
          " . ($is_immo ? "Une nouvelle demande concernant l'achat ou la vente d'une parcelle a été reçue depuis la rubrique Immobilier du site web." : "Une nouvelle demande de devis ou de contact a été transmise depuis le site web officiel.") . "
        </p>

        <table width='100%' cellspacing='0' cellpadding='8' style='border-collapse:collapse; margin-top:16px; font-size:14px;'>
          <tr style='background:#f8fafc; border-bottom:1px solid #e2e8f0;'>
            <td width='35%' style='padding:10px; font-weight:700; color:#102d70;'>Demandeur / Raison sociale :</td>
            <td style='padding:10px; color:#1e293b;'><strong>" . nl2br($nom) . "</strong></td>
          </tr>
          <tr style='border-bottom:1px solid #e2e8f0;'>
            <td style='padding:10px; font-weight:700; color:#102d70;'>Téléphone :</td>
            <td style='padding:10px; color:#1e293b;'><a href='tel:" . preg_replace('/[^0-9+]/', '', $telephone) . "' style='color:#159447; font-weight:700; text-decoration:none;'>" . $telephone . "</a></td>
          </tr>
          <tr style='background:#f8fafc; border-bottom:1px solid #e2e8f0;'>
            <td style='padding:10px; font-weight:700; color:#102d70;'>Adresse e-mail :</td>
            <td style='padding:10px; color:#1e293b;'>" . (!empty($email) ? "<a href='mailto:{$email}' style='color:#0878e8; text-decoration:none;'>{$email}</a>" : "<span style='color:#94a3b8; font-style:italic;'>Non renseignée</span>") . "</td>
          </tr>
" . ($is_immo ? "
          <tr style='border-bottom:1px solid #e2e8f0;'>
            <td style='padding:10px; font-weight:700; color:#102d70;'>Type de demande :</td>
            <td style='padding:10px; color:#1e293b;'><span style='background:#dcfce7; color:#15803d; padding:3px 8px; border-radius:4px; font-weight:700;'>" . $type_immo_libelle . "</span></td>
          </tr>
          <tr style='background:#f8fafc; border-bottom:1px solid #e2e8f0;'>
            <td style='padding:10px; font-weight:700; color:#102d70;'>Zone concernée :</td>
            <td style='padding:10px; color:#1e293b;'><span style='background:#e0f2fe; color:#0369a1; padding:3px 8px; border-radius:4px; font-weight:600;'>" . $zone . "</span></td>
          </tr>
" : "
          <tr style='border-bottom:1px solid #e2e8f0;'>
            <td style='padding:10px; font-weight:700; color:#102d70;'>Prestation souhaitée :</td>
            <td style='padding:10px; color:#1e293b;'><span style='background:#e0f2fe; color:#0369a1; padding:3px 8px; border-radius:4px; font-weight:600;'>" . $prestation_libelle . "</span></td>
          </tr>
          <tr style='background:#f8fafc; border-bottom:1px solid #e2e8f0;'>
            <td style='padding:10px; font-weight:700; color:#102d70;'>Localisation du projet :</td>
            <td style='padding:10px; color:#1e293b;'><strong>" . $localisation . "</strong></td>
          </tr>
          <tr style='border-bottom:1px solid #e2e8f0;'>
            <td style='padding:10px; font-weight:700; color:#102d70;'>Délai souhaité :</td>
            <td style='padding:10px; color:#1e293b;'>" . $delai_libelle . "</td>
          </tr>
") . "
        </table>

        <!-- Description -->
        <div style='margin-top:24px; padding:16px; background:#f8fafc; border-left:4px solid #159447; border-radius:4px;'>
          <div style='font-size:13px; font-weight:700; text-transform:uppercase; color:#102d70; margin-bottom:8px;'>" . ($is_immo ? "Description du besoin immobilier / Détails de la parcelle :" : "Description du projet :") . "</div>
          <div style='font-size:14px; line-height:1.6; color:#1e293b; white-space:pre-wrap;'>" . nl2br($besoin) . "</div>
        </div>

        <!-- Action directe WhatsApp / Tel -->
        <div style='margin-top:24px; padding:16px; background:#ecfdf5; border-radius:6px; text-align:center;'>
          <div style='font-size:13px; color:#065f46; font-weight:600; margin-bottom:10px;'>Action rapide auprès du demandeur :</div>
          <a href='https://wa.me/" . preg_replace('/[^0-9]/', '', $telephone) . "' target='_blank' style='display:inline-block; background:#25D366; color:#ffffff; padding:10px 18px; border-radius:6px; font-size:13px; font-weight:700; text-decoration:none; margin-right:8px;'>Écrire sur WhatsApp</a>
          <a href='tel:" . preg_replace('/[^0-9+]/', '', $telephone) . "' style='display:inline-block; background:#102d70; color:#ffffff; padding:10px 18px; border-radius:6px; font-size:13px; font-weight:700; text-decoration:none;'>Appeler directement</a>
        </div>
      </td>
    </tr>

    <!-- Pied de page -->
    <tr>
      <td style='background:#f1f5f9; padding:16px 24px; text-align:center; font-size:12px; color:#64748b; border-top:1px solid #e2e8f0;'>
        Demande reçue le {$date_envoi} &bull; IP : {$ip_client}<br/>
        TOPO SABUGNOUMA WASSA &bull; Doumanzana Nafadji, Bamako, Mali &bull; Tél : +223 76 29 29 49
      </td>
    </tr>

  </table>
</body>
</html>
";

// En-têtes du courriel
$headers   = [];
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: text/html; charset=UTF-8";
$headers[] = "From: {$from_name} <{$from_email}>";
if (!empty($email)) {
    $headers[] = "Reply-To: {$nom} <{$email}>";
}
if (!empty($cc) && filter_var($cc, FILTER_VALIDATE_EMAIL)) {
    $headers[] = "Cc: {$cc}";
}
$headers[] = "X-Mailer: PHP/" . phpversion();

// ============================================================
// ENVOI EFFECTIF DU COURRIEL VIA PHP mail()
// ============================================================
$sent = @mail($to, $subject, $email_html, implode("\r\n", $headers));

if ($sent) {
    echo json_encode([
        'success' => true,
        'message' => 'Votre demande de devis a été transmise avec succès par e-mail à nos équipes techniques.'
    ], JSON_UNESCAPED_UNICODE);
} else {
    // Si l'envoi mail() échoue (ex: test local sans serveur SMTP actif),
    // on informe le frontend tout en validant la saisie pour que le relais WhatsApp prenne le relais.
    echo json_encode([
        'success' => true,
        'warning' => 'Le service de messagerie local n\'a pu envoyer l\'e-mail directement, le relais WhatsApp prend le relais.',
        'message' => 'Votre demande a été enregistrée. Pour une prise en compte immédiate, vous pouvez la confirmer via WhatsApp.'
    ], JSON_UNESCAPED_UNICODE);
}
