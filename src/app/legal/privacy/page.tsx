// /legal/privacy — Política de privacidad (EN + ES). Pública.
// Texto base redactado 2026-09-05 a partir de lo que el sistema realmente hace
// (ver AUDITORIA_LEGAL.md). PENDIENTE: revisión por abogado salvadoreño.
import type { Metadata } from 'next';
import { LegalShell, type LegalSection } from '../LegalShell';
import { PRIVACY_VERSION, LEGAL_CONTACT_EMAIL, LEGAL_ENTITY } from '@/lib/legal/versions';

export const metadata: Metadata = { title: 'Privacy Policy — The Surf Sequence', robots: { index: true } };

const EN: LegalSection[] = [
  { h: '1. Who we are', p: [
    `${LEGAL_ENTITY} (El Salvador), operating as The Surf Sequence® and Puro Surf Academy, is the data controller for the personal data collected through thesurfsequence.com, app.thesurfsequence.com, the student portal, the coach portal, the level quiz and the class-booking pages (together, the "Service").`,
    `Contact for anything related to your data: ${LEGAL_CONTACT_EMAIL}.`,
  ]},
  { h: '2. What we collect', p: [
    'Identity and contact: first and last name, email, phone / WhatsApp, date of birth, nationality, languages, Instagram handle (optional), profile photo (optional).',
    'Safety and health data (only what you or your guardian give us): emergency contact, swimming ability, allergies, injuries, medical conditions, height and weight (to pick your board), fears or concerns related to the ocean. We ask for your explicit consent before storing this.',
    'Surf profile and progress: level quiz answers and score, belt level, evaluations by your coach, self-evaluations, training sessions you log, goals, notes written by your coach about your surfing.',
    'Images and video: photos and video clips of your surfing, only when you (or your guardian) authorize it separately.',
    'Bookings and payments: classes and camps you book, what you paid and how. Card data is handled by the payment provider; we never see or store card numbers.',
    'Technical: session cookies needed to keep you logged in, the date, IP address and browser used when you accept a waiver or these terms (as evidence of acceptance), and server logs.',
    'Minors: for surfers under 18 we collect the name and relationship of the parent or legal guardian who signs for them. We do not knowingly collect data from children under 7 online; those bookings are handled in person.',
  ]},
  { h: '3. Why we use it', p: [
    '- To run your classes, camps and training safely (emergency contact, health data, swim level).',
    '- To teach you: your level, evaluations, progress and personalized program.',
    '- To give you access to what you bought: course, book, membership, portal.',
    '- To send you transactional emails: your portal link, booking confirmations, session reports, reminders, surveys about your experience.',
    '- To keep records we are required or entitled to keep (signed waivers, invoices, disputes).',
    '- To improve the Service using aggregated, non-identifying statistics.',
    'We do not sell your data. We do not send marketing emails without asking you first.',
  ]},
  { h: '4. Who else processes your data', p: [
    'We use these providers, under their own data-processing terms:',
    '- Supabase (database, file storage and login) — servers in the United States.',
    '- Vercel (hosting of the application) — United States.',
    '- Resend (transactional email delivery) — United States.',
    '- Wompi (online payments, El Salvador) — receives your name and email to process a purchase.',
    '- GitHub (source code hosting; no personal data of users is stored there).',
    'Affiliated academies: if you train at an academy that uses The Surf Sequence, the coaches and coordinators of that academy see your profile, safety data and progress, because they need it to coach you.',
    'We share data with authorities only when the law requires it.',
  ]},
  { h: '5. How long we keep it', p: [
    'While you have an active relationship with us (student, member, lead) and for as long as needed afterwards to keep the signed waiver, payment records and to defend legal claims.',
    'Level-quiz attempts and leads that never become students are deleted or anonymized after a reasonable period.',
    'When you ask us to delete your data (section 6) we anonymize your profile: name, contact details, photo, health data and free-text notes are erased; the minimal record of your signed waiver and payments is kept.',
  ]},
  { h: '6. Your rights', p: [
    'You can ask us at any time to: access the data we hold about you, correct it, receive a copy, withdraw a consent you gave (for example the use of your image or of your health data), or delete your account.',
    `Write to ${LEGAL_CONTACT_EMAIL} from the email address linked to your profile. We answer within 15 business days. Withdrawing consent does not affect what was lawfully done before.`,
    'Parents or legal guardians exercise these rights on behalf of minors.',
  ]},
  { h: '7. Images and video', p: [
    'Photos and video of your surfing are taken only with your separate, optional authorization, which you can withdraw at any time. If you authorize it, we may use them inside the Service (video analysis, your progress) and, when you tick that option, in our educational and promotional content. Withdrawal stops future use; content already published may take time to be removed.',
  ]},
  { h: '8. Artificial intelligence', p: [
    'Today the Service does not process your personal data with artificial-intelligence systems. If we introduce features that do (for example automated video analysis or training recommendations), we will update this policy and tell you before your data is used that way.',
  ]},
  { h: '9. Cookies', p: [
    'We use only strictly necessary cookies: your login session and your student session. We do not use advertising or analytics cookies. If that changes, we will ask for your consent.',
  ]},
  { h: '10. Security', p: [
    'Data is encrypted in transit, stored with per-row access rules, and files such as the book are served only through your personal, non-shareable link. Access by staff is limited by role and logged. No system is perfectly secure; if a breach affects you we will inform you as the law requires.',
  ]},
  { h: '11. Changes and law', p: [
    'We may update this policy; the version and date appear at the top and we will ask you to accept material changes in your portal. This policy is governed by the laws of El Salvador, including its personal-data protection legislation. The Spanish text prevails in case of conflict.',
  ]},
];

const ES: LegalSection[] = [
  { h: '1. Quiénes somos', p: [
    `${LEGAL_ENTITY} (El Salvador), que opera como The Surf Sequence® y Puro Surf Academy, es la responsable del tratamiento de los datos personales recolectados a través de thesurfsequence.com, app.thesurfsequence.com, el portal del alumno, el portal del coach, el quiz de nivel y las páginas de reserva de clases (en conjunto, el "Servicio").`,
    `Contacto para todo lo relacionado con tus datos: ${LEGAL_CONTACT_EMAIL}.`,
  ]},
  { h: '2. Qué datos recolectamos', p: [
    'Identidad y contacto: nombre y apellido, email, teléfono / WhatsApp, fecha de nacimiento, nacionalidad, idiomas, usuario de Instagram (opcional), foto de perfil (opcional).',
    'Datos de seguridad y salud (solo los que vos o tu tutor nos dan): contacto de emergencia, nivel de natación, alergias, lesiones, condiciones médicas, estatura y peso (para elegir tu tabla), miedos o preocupaciones relacionados con el mar. Pedimos tu consentimiento expreso antes de guardarlos.',
    'Perfil y progreso de surf: respuestas y puntaje del quiz de nivel, cinta, evaluaciones de tu coach, autoevaluaciones, sesiones de entrenamiento que registrás, objetivos, notas de tu coach sobre tu surf.',
    'Imágenes y video: fotos y clips de tu surf, solo cuando vos (o tu tutor) lo autorizan por separado.',
    'Reservas y pagos: clases y camps que reservás, qué pagaste y cómo. Los datos de tarjeta los maneja el proveedor de pagos; nunca vemos ni guardamos números de tarjeta.',
    'Técnicos: cookies de sesión necesarias para mantenerte conectado, la fecha, dirección IP y navegador usados al aceptar un waiver o estos términos (como evidencia de aceptación), y registros del servidor.',
    'Menores: para surfistas menores de 18 años recolectamos el nombre y la relación del padre, madre o tutor legal que firma por ellos. No recolectamos a sabiendas datos de menores de 7 años en línea; esas reservas se hacen en persona.',
  ]},
  { h: '3. Para qué los usamos', p: [
    '- Para dar tus clases, camps y entrenamientos con seguridad (contacto de emergencia, datos de salud, nivel de natación).',
    '- Para enseñarte: tu nivel, evaluaciones, progreso y programa personalizado.',
    '- Para darte acceso a lo que compraste: curso, libro, membresía, portal.',
    '- Para mandarte correos transaccionales: tu link al portal, confirmaciones de reserva, reportes de sesión, recordatorios, encuestas sobre tu experiencia.',
    '- Para conservar los registros que la ley nos exige o permite (waivers firmados, facturas, disputas).',
    '- Para mejorar el Servicio con estadísticas agregadas que no te identifican.',
    'No vendemos tus datos. No enviamos correos de marketing sin preguntarte antes.',
  ]},
  { h: '4. Quién más trata tus datos', p: [
    'Usamos estos proveedores, bajo sus propios términos de tratamiento de datos:',
    '- Supabase (base de datos, almacenamiento de archivos e inicio de sesión) — servidores en Estados Unidos.',
    '- Vercel (alojamiento de la aplicación) — Estados Unidos.',
    '- Resend (envío de correos transaccionales) — Estados Unidos.',
    '- Wompi (pagos en línea, El Salvador) — recibe tu nombre y email para procesar una compra.',
    '- GitHub (alojamiento del código fuente; ahí no se guardan datos personales de usuarios).',
    'Academias afiliadas: si entrenás en una academia que usa The Surf Sequence, los coaches y coordinadores de esa academia ven tu perfil, tus datos de seguridad y tu progreso, porque los necesitan para entrenarte.',
    'Compartimos datos con autoridades solo cuando la ley lo exige.',
  ]},
  { h: '5. Cuánto tiempo los guardamos', p: [
    'Mientras tengas una relación activa con nosotros (alumno, miembro, lead) y después el tiempo necesario para conservar el waiver firmado, los registros de pago y para defender reclamos legales.',
    'Los intentos del quiz de nivel y los leads que nunca se convierten en alumnos se borran o anonimizan después de un plazo razonable.',
    'Cuando nos pedís borrar tus datos (sección 6) anonimizamos tu ficha: nombre, datos de contacto, foto, datos de salud y notas de texto libre se borran; se conserva el registro mínimo de tu waiver firmado y de tus pagos.',
  ]},
  { h: '6. Tus derechos', p: [
    'Podés pedirnos en cualquier momento: acceder a los datos que tenemos sobre vos, corregirlos, recibir una copia, retirar un consentimiento que diste (por ejemplo el uso de tu imagen o de tus datos de salud), o borrar tu cuenta.',
    `Escribinos a ${LEGAL_CONTACT_EMAIL} desde el email vinculado a tu perfil. Respondemos en un plazo de 15 días hábiles. Retirar un consentimiento no afecta lo que se hizo legalmente antes.`,
    'Los padres o tutores legales ejercen estos derechos en nombre de los menores.',
  ]},
  { h: '7. Imágenes y video', p: [
    'Las fotos y videos de tu surf se toman solo con tu autorización separada y opcional, que podés retirar en cualquier momento. Si la das, podemos usarlos dentro del Servicio (análisis de video, tu progreso) y, cuando marcás esa opción, en nuestro contenido educativo y promocional. Retirarla detiene el uso futuro; el contenido ya publicado puede tardar en retirarse.',
  ]},
  { h: '8. Inteligencia artificial', p: [
    'Hoy el Servicio no procesa tus datos personales con sistemas de inteligencia artificial. Si incorporamos funciones que lo hagan (por ejemplo análisis automático de video o recomendaciones de entrenamiento), actualizaremos esta política y te lo diremos antes de usar tus datos de esa forma.',
  ]},
  { h: '9. Cookies', p: [
    'Usamos solo cookies estrictamente necesarias: tu sesión de inicio y tu sesión de alumno. No usamos cookies de publicidad ni de analítica. Si eso cambia, te pediremos consentimiento.',
  ]},
  { h: '10. Seguridad', p: [
    'Los datos viajan cifrados, se guardan con reglas de acceso por fila, y archivos como el libro se sirven solo a través de tu link personal e intransferible. El acceso del personal está limitado por rol y queda registrado. Ningún sistema es perfectamente seguro; si una brecha te afecta te informaremos como exige la ley.',
  ]},
  { h: '11. Cambios y ley aplicable', p: [
    'Podemos actualizar esta política; la versión y la fecha aparecen arriba y te pediremos aceptar los cambios materiales en tu portal. Esta política se rige por las leyes de El Salvador, incluida su legislación de protección de datos personales. En caso de conflicto prevalece el texto en español.',
  ]},
];

export default function PrivacyPage() {
  return (
    <LegalShell
      title={{ en: 'Privacy Policy', es: 'Política de privacidad' }}
      updated="2026-09-05"
      version={PRIVACY_VERSION}
      intro={{
        en: 'Short version: we keep the data we need to coach you safely, we do not sell it, we tell you who helps us process it, and you can ask us to correct or delete it anytime.',
        es: 'Versión corta: guardamos los datos que necesitamos para entrenarte con seguridad, no los vendemos, te decimos quién nos ayuda a procesarlos, y podés pedirnos corregirlos o borrarlos cuando quieras.',
      }}
      en={EN}
      es={ES}
      other={{ href: '/legal/terms', label: 'Terms of Service' }}
    />
  );
}
