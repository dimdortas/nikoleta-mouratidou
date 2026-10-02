/* =============================================================
   ΦΩΤΟΓΡΑΦΙΕΣ

   Πραγματικές φωτογραφίες του γραφείου στη Θεσσαλονίκη.
   Περνούν από το `astro:assets`: ο Astro παράγει αυτόματα WebP και
   πολλαπλά πλάτη, οπότε εδώ δηλώνουμε μόνο το αρχείο και το alt.

   Για αντικατάσταση: βάλτε το νέο αρχείο στο `src/assets/photos/`
   και αλλάξτε το import. Τίποτα άλλο.
   ============================================================= */

import type { ImageMetadata } from 'astro';

import room01 from '../assets/photos/02.jpeg';
import roomWide from '../assets/photos/09.jpeg';
import roomAlt from '../assets/photos/04.jpeg';
import detailVase from '../assets/photos/03.jpeg';
import shelf from '../assets/photos/06.jpeg';
import desk from '../assets/photos/05.jpeg';
import kidsCorner from '../assets/photos/01.jpeg';
import kidsTable from '../assets/photos/08.jpeg';
import portrait from '../assets/photos/07.jpeg';

export type Photo = {
  src: ImageMetadata;
  alt: string;
  /** object-position για το crop — κρατά το σημαντικό μέρος στο κάδρο */
  position?: string;
};

export const photos = {
  /** Πορτρέτο — Σχετικά με εμένα */
  portrait: {
    src: portrait,
    alt: 'Η Νικολέτα Ραφαέλα Μουρατίδου στον χώρο των συνεδριών.',
    position: '50% 28%',
  },

  /** Ο χώρος των συνεδριών, κάθετη λήψη */
  room: {
    src: room01,
    alt: 'Ο χώρος των συνεδριών: καναπές, πολυθρόνα και χαμηλό τραπέζι σε ζεστό φως.',
    position: '50% 50%',
  },

  /** Ο χώρος των συνεδριών, οριζόντια λήψη */
  roomWide: {
    src: roomWide,
    alt: 'Ο χώρος των συνεδριών στη Θεσσαλονίκη.',
    position: '50% 55%',
  },

  /** Λεπτομέρεια: ευκάλυπτος στο τραπέζι */
  detail: {
    src: detailVase,
    alt: 'Λεπτομέρεια του χώρου: κλαδί ευκαλύπτου σε βάζο πάνω στο τραπέζι.',
    position: '58% 50%',
  },

  /** Βιβλιοθήκη σε θερμό φωτισμό */
  shelf: {
    src: shelf,
    alt: 'Ράφι με βιβλία και φυτά, σε θερμό φωτισμό.',
    position: '50% 60%',
  },

  /** Γραφείο συναντήσεων */
  desk: {
    src: desk,
    alt: 'Γραφείο με καρέκλες, για συναντήσεις και συμβουλευτική.',
    position: '55% 50%',
  },

  /** Γωνιά παιδιών — ευρεία */
  kids: {
    src: kidsCorner,
    alt: 'Γωνιά για παιδιά: χαμηλό τραπέζι με καρέκλες, ράφι με παιχνίδια και παιδικά σχέδια στον τοίχο.',
    position: '50% 50%',
  },

  /** Γωνιά παιδιών — λεπτομέρεια. Εφεδρική: δείχνει το ίδιο κάδρο με το
      `kids`, γι' αυτό δεν μπαίνει δίπλα του. Έτοιμη αν χρειαστεί αλλού. */
  kidsDetail: {
    src: kidsTable,
    alt: 'Παιδικό τραπέζι με ξυλομπογιές και μαρκαδόρους.',
    position: '50% 45%',
  },

  /** Εφεδρική λήψη του χώρου — σχεδόν ίδια με τη `roomWide`, αχρησιμοποίητη */
  roomAlt: {
    src: roomAlt,
    alt: 'Ο χώρος των συνεδριών.',
    position: '50% 50%',
  },
} satisfies Record<string, Photo>;
