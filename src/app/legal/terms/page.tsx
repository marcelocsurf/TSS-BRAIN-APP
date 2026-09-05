// /legal/terms — Términos de uso del app, portal, curso, libro, membresía y
// reservas (EN + ES). Pública. PENDIENTE: revisión por abogado salvadoreño.
import type { Metadata } from 'next';
import { LegalShell, type LegalSection } from '../LegalShell';
import { TERMS_VERSION, LEGAL_CONTACT_EMAIL, LEGAL_ENTITY } from '@/lib/legal/versions';

export const metadata: Metadata = { title: 'Terms of Service — The Surf Sequence', robots: { index: true } };

const EN: LegalSection[] = [
  { h: '1. Who you are dealing with', p: [
    `These terms are an agreement between you and ${LEGAL_ENTITY} (El Salvador), operating as The Surf Sequence® and Puro Surf Academy ("we"). They cover the website, the app at app.thesurfsequence.com, the student and coach portals, the online course, the ONE WAVE book, memberships, programs, and classes or camps booked through the Service.`,
    'By creating a profile, accepting them in your portal, booking a class or using a gift or course code, you accept these terms and our Privacy Policy. If you are under 18, your parent or legal guardian accepts them for you.',
  ]},
  { h: '2. Your account and portal link', p: [
    'Your portal is opened with a personal link (and optionally a PIN). That link is your credential: keep it private. Sharing it gives the other person your whole profile, and we may suspend access that is being shared.',
    'Give us accurate information, especially safety and health data. Update it when it changes.',
  ]},
  { h: '3. Water activities and the waiver', p: [
    'Surfing is inherently dangerous. Participation in any class, camp, evaluation or training requires a signed liability waiver, which is a separate document shown before your first session. These terms do not replace it.',
    'Drills, missions, videos and the course are educational reference material. Practicing them without supervision, above your level, or in conditions your coach has not cleared, is at your own risk. Always follow your coach and the safety rules.',
  ]},
  { h: '4. Course, book and digital content', p: [
    'The course, book, videos, drills, missions, sequences, evaluations and the method are the intellectual property of The Surf Sequence® and are licensed to you for personal, non-commercial use only. You may not copy, share, resell, teach commercially or publish them.',
    'Access to the online course is granted per belt level with a code or purchase and lasts as long as your access or membership is active. The book is delivered inside your portal and cannot be downloaded or transferred.',
    'We may update, correct or retire content to keep the method coherent.',
  ]},
  { h: '5. Membership and programs', p: [
    'A membership gives access to training tools (Let\'s Play, progress tracking, programs) for the period bought. When it ends, those views close until renewed; your data and your course access remain.',
    'High-performance programs, nutrition notes and season plans are coaching guidance, not medical advice. Consult a doctor before following any physical or dietary plan.',
  ]},
  { h: '6. Bookings, payments, cancellations and refunds', p: [
    'Prices are shown in US dollars before you confirm. Classes booked through the class page can be cancelled or moved free of charge up to 24 hours before the start; inside 24 hours the full class is due.',
    'Camps: once a camp has started, no new enrollments are accepted and unused days are not refunded, except where the law requires it.',
    'Digital products (course codes, book, memberships) are delivered immediately and are non-refundable once accessed, except when required by consumer law or when the product does not work and we cannot fix it.',
    'Online payments are processed by Wompi; we never store your card details. Gift links and codes are single-use and may have an expiry date.',
  ]},
  { h: '7. Coaches, academies and evaluations', p: [
    'Evaluations, belt promotions and recommendations are made by certified coaches following the method and are their professional judgment; a belt is a description of your level inside the method, not a guarantee of safety in the ocean.',
    'Affiliated academies using the Service are independent businesses responsible for the classes they deliver.',
  ]},
  { h: '8. Community and your content', p: [
    'What you post in community spaces, notes and self-evaluations must be respectful and lawful. You keep ownership of it and give us a license to display it inside the Service. We may remove content that breaks these rules.',
  ]},
  { h: '9. Suspension and termination', p: [
    'We may suspend or close access when these terms are broken, when a link is shared, for non-payment, or for behaviour that puts others at risk. You may close your account at any time by writing to us; see the Privacy Policy for what we keep.',
  ]},
  { h: '10. Availability and liability', p: [
    'We work to keep the Service available but do not guarantee it will be uninterrupted or error-free. To the extent permitted by law, our liability for the digital Service is limited to the amount you paid for it in the last 12 months. Nothing here limits liability that cannot be limited by law; liability for water activities is governed by the waiver.',
  ]},
  { h: '11. Changes, law and contact', p: [
    `We may update these terms; the version and date appear at the top, and material changes are shown in your portal for acceptance. These terms are governed by the laws of El Salvador; disputes go to the courts of San Salvador unless mandatory consumer rules say otherwise. The Spanish text prevails in case of conflict. Contact: ${LEGAL_CONTACT_EMAIL}.`,
  ]},
];

const ES: LegalSection[] = [
  { h: '1. Con quién contratás', p: [
    `Estos términos son un acuerdo entre vos y ${LEGAL_ENTITY} (El Salvador), que opera como The Surf Sequence® y Puro Surf Academy ("nosotros"). Cubren el sitio web, la aplicación en app.thesurfsequence.com, los portales de alumno y de coach, el curso en línea, el libro ONE WAVE, las membresías, los programas y las clases o camps reservados a través del Servicio.`,
    'Al crear un perfil, aceptarlos en tu portal, reservar una clase o usar un código de regalo o de curso, aceptás estos términos y nuestra Política de privacidad. Si sos menor de 18 años, tu padre, madre o tutor legal los acepta por vos.',
  ]},
  { h: '2. Tu cuenta y tu link al portal', p: [
    'Tu portal se abre con un link personal (y opcionalmente un PIN). Ese link es tu credencial: mantenelo privado. Compartirlo le da a la otra persona todo tu perfil, y podemos suspender un acceso que se esté compartiendo.',
    'Danos información exacta, sobre todo los datos de seguridad y salud. Actualizalos cuando cambien.',
  ]},
  { h: '3. Actividades en el agua y el waiver', p: [
    'El surf es inherentemente peligroso. Participar en cualquier clase, camp, evaluación o entrenamiento requiere un waiver de responsabilidad firmado, que es un documento aparte que se muestra antes de tu primera sesión. Estos términos no lo reemplazan.',
    'Los drills, misiones, videos y el curso son material educativo de referencia. Practicarlos sin supervisión, por encima de tu nivel o en condiciones que tu coach no autorizó es bajo tu propio riesgo. Seguí siempre a tu coach y las reglas de seguridad.',
  ]},
  { h: '4. Curso, libro y contenido digital', p: [
    'El curso, el libro, los videos, drills, misiones, secuencias, evaluaciones y el método son propiedad intelectual de The Surf Sequence® y se te licencian solo para uso personal y no comercial. No podés copiarlos, compartirlos, revenderlos, enseñarlos comercialmente ni publicarlos.',
    'El acceso al curso en línea se otorga por cinta con un código o una compra y dura mientras tu acceso o membresía esté activo. El libro se entrega dentro de tu portal y no se puede descargar ni transferir.',
    'Podemos actualizar, corregir o retirar contenido para mantener la coherencia del método.',
  ]},
  { h: '5. Membresía y programas', p: [
    'Una membresía da acceso a las herramientas de entrenamiento (Let\'s Play, seguimiento de progreso, programas) por el período comprado. Al vencer, esas vistas se cierran hasta renovar; tus datos y tu acceso al curso se mantienen.',
    'Los programas de alto rendimiento, las notas de nutrición y los planes de temporada son guía de entrenamiento, no consejo médico. Consultá a un médico antes de seguir cualquier plan físico o alimentario.',
  ]},
  { h: '6. Reservas, pagos, cancelaciones y reembolsos', p: [
    'Los precios se muestran en dólares antes de confirmar. Las clases reservadas por la página de clases se pueden cancelar o mover sin costo hasta 24 horas antes del inicio; dentro de las 24 horas se debe la clase completa.',
    'Camps: una vez iniciado un camp no se aceptan nuevas inscripciones y los días no usados no se reembolsan, salvo que la ley lo exija.',
    'Los productos digitales (códigos de curso, libro, membresías) se entregan de inmediato y no son reembolsables una vez accedidos, salvo cuando la ley del consumidor lo exija o cuando el producto no funcione y no podamos arreglarlo.',
    'Los pagos en línea los procesa Wompi; nunca guardamos los datos de tu tarjeta. Los links y códigos de regalo son de un solo uso y pueden tener fecha de vencimiento.',
  ]},
  { h: '7. Coaches, academias y evaluaciones', p: [
    'Las evaluaciones, promociones de cinta y recomendaciones las hacen coaches certificados siguiendo el método y son su criterio profesional; una cinta describe tu nivel dentro del método, no garantiza tu seguridad en el mar.',
    'Las academias afiliadas que usan el Servicio son negocios independientes responsables de las clases que dan.',
  ]},
  { h: '8. Comunidad y tu contenido', p: [
    'Lo que publicás en los espacios de comunidad, notas y autoevaluaciones debe ser respetuoso y legal. Conservás su propiedad y nos das licencia para mostrarlo dentro del Servicio. Podemos retirar contenido que rompa estas reglas.',
  ]},
  { h: '9. Suspensión y terminación', p: [
    'Podemos suspender o cerrar el acceso cuando se rompan estos términos, cuando se comparta un link, por falta de pago o por conductas que pongan en riesgo a otros. Podés cerrar tu cuenta cuando quieras escribiéndonos; en la Política de privacidad está qué conservamos.',
  ]},
  { h: '10. Disponibilidad y responsabilidad', p: [
    'Trabajamos para mantener el Servicio disponible pero no garantizamos que sea ininterrumpido ni libre de errores. En la medida que la ley lo permite, nuestra responsabilidad por el Servicio digital se limita a lo que pagaste por él en los últimos 12 meses. Nada de esto limita la responsabilidad que la ley no permite limitar; la responsabilidad por actividades en el agua se rige por el waiver.',
  ]},
  { h: '11. Cambios, ley aplicable y contacto', p: [
    `Podemos actualizar estos términos; la versión y la fecha aparecen arriba, y los cambios materiales se muestran en tu portal para su aceptación. Estos términos se rigen por las leyes de El Salvador; las disputas se resuelven en los tribunales de San Salvador salvo que normas imperativas del consumidor digan otra cosa. En caso de conflicto prevalece el texto en español. Contacto: ${LEGAL_CONTACT_EMAIL}.`,
  ]},
];

export default function TermsPage() {
  return (
    <LegalShell
      title={{ en: 'Terms of Service', es: 'Términos y condiciones' }}
      updated="2026-09-05"
      version={TERMS_VERSION}
      en={EN}
      es={ES}
      other={{ href: '/legal/privacy', label: 'Privacy Policy' }}
    />
  );
}
