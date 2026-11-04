<?php
// ===== FORMULARIO DE CONTACTO =====
// Recibe el formulario de index.html (fetch POST) y lo envia con el servidor de correo del
// propio hosting (DonWeb). Responde JSON: {"ok": true} o {"ok": false, "error": "..."}.

// ----- CONFIGURACION -----
const MAIL_TO   = 'soportetecnico.soltecs@gmail.com'; // Produccion: Info@gfgroupcorp.com
const MAIL_BCC  = '';                                 // Copia oculta opcional
const MAIL_FROM = 'info@gf-painting.com';             // Buzon del dominio (SPF/DKIM de DonWeb)
const FROM_NAME = 'GF Painting Website';

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

function responder(int $status, bool $ok, string $error = ''): void {
  http_response_code($status);
  echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error]);
  exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  header('Allow: POST');
  responder(405, false, 'Method not allowed');
}

// Campo trampa: los bots lo completan, las personas no lo ven.
// Se responde "ok" para que el bot no reintente.
if (!empty($_POST['website'])) {
  responder(200, true);
}

// Limpia un campo de una linea: sin saltos (evita inyeccion de cabeceras) y con largo maximo
function campo(string $nombre, int $max = 120): string {
  $valor = trim((string)($_POST[$nombre] ?? ''));
  $valor = preg_replace('/[\r\n\t]+/', ' ', $valor);
  return mb_substr($valor, 0, $max);
}

$name    = campo('name');
$company = campo('company');
$email   = campo('email', 254);
$phone   = campo('phone', 40);
$city    = campo('city');
$state   = campo('state', 60);
$service = campo('service');
$message = mb_substr(trim((string)($_POST['message'] ?? '')), 0, 5000);

if ($name === '' || $phone === '' || $city === '' || $state === '' || $service === '' || $message === '') {
  responder(422, false, 'Missing required fields');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  responder(422, false, 'Invalid email');
}

$subject = "New estimate request: $service - $name";
$body = "Name: $name\n"
      . "Company: " . ($company !== '' ? $company : '-') . "\n"
      . "Email: $email\n"
      . "Phone: $phone\n"
      . "City / State: $city, $state\n"
      . "Service: $service\n\n"
      . "Message:\n$message\n\n"
      . "--\nSent from the contact form at https://gf-painting.com\n";

$headers = [
  'From: =?UTF-8?B?' . base64_encode(FROM_NAME) . '?= <' . MAIL_FROM . '>',
  'Reply-To: ' . $email,
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'Content-Transfer-Encoding: 8bit',
];
if (MAIL_BCC !== '') {
  $headers[] = 'Bcc: ' . MAIL_BCC;
}

$enviado = mail(
  MAIL_TO,
  '=?UTF-8?B?' . base64_encode($subject) . '?=',
  str_replace("\n", "\r\n", $body),
  implode("\r\n", $headers),
  '-f' . MAIL_FROM // remitente del sobre = dominio propio (SPF alineado)
);

if (!$enviado) {
  error_log('contact.php: mail() devolvio false');
  responder(500, false, 'Mail server error');
}
responder(200, true);
