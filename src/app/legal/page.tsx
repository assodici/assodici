import type { Metadata } from "next"
import { ProsePage } from "@/components/layout/prose-page"
import { LEGAL } from "@/lib/legal"

export const metadata: Metadata = { title: "Mentions légales et confidentialité", alternates: { canonical: "/legal" } }

export default function LegalPage() {
  return (
    <ProsePage title="Mentions légales et confidentialité" intro={`Dernière mise à jour : ${LEGAL.lastUpdated}.`}>
      <h2>Éditeur du site</h2>
      <ul>
        <li>Éditeur : {LEGAL.publisherName}</li>
        <li>Statut : {LEGAL.publisherStatus}</li>
        <li>Adresse : {LEGAL.publisherAddress}</li>
        <li>Directeur ou directrice de la publication : {LEGAL.publicationDirector}</li>
        <li>Contact : {LEGAL.contactEmail}</li>
      </ul>

      <h2>Hébergement</h2>
      <ul>
        <li>Site : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</li>
        <li>
          Base de données et authentification : Supabase Inc., données hébergées dans l&apos;Union européenne
          (Irlande).
        </li>
      </ul>

      <h2>Données publiques</h2>
      <p>
        Les fiches des associations reprennent le Répertoire national des associations (RNA, fichier Waldec) et la
        nomenclature des objets sociaux, publiés par le ministère de l&apos;Intérieur sur{" "}
        <a href="https://www.data.gouv.fr/datasets/repertoire-national-des-associations">data.gouv.fr</a> sous{" "}
        <a href="https://www.etalab.gouv.fr/licence-ouverte-open-licence/">Licence Ouverte 2.0</a>. Les données sont
        mises à jour chaque semaine. Asso d&apos;ici les met en forme (casse, adresses) et les complète avec les
        informations fournies par les associations ; ces ajouts sont signalés comme tels.
      </p>

      <h2>Contenus publiés par les associations</h2>
      <p>
        Toute personne connectée peut revendiquer la page d&apos;une association qu&apos;elle représente et y publier
        des informations. En le faisant, elle déclare être habilitée à représenter cette association et reste
        responsable des contenus publiés. Ces contenus doivent être exacts et ne contenir aucune donnée personnelle
        de tiers sans leur accord.
      </p>
      <p>
        L&apos;éditeur peut retirer une revendication ou un contenu inexact, trompeur ou illicite, notamment sur
        signalement à {LEGAL.contactEmail}.
      </p>

      <h2>Données personnelles</h2>
      <h3>Responsable du traitement</h3>
      <p>{LEGAL.publisherName}, joignable à {LEGAL.contactEmail}.</p>
      <h3>Données traitées et finalités</h3>
      <ul>
        <li>
          Adresse email du compte : pour vous envoyer le lien de connexion et associer les pages que vous gérez à
          votre compte. Base légale : exécution du service que vous demandez.
        </li>
        <li>
          Informations saisies sur la page d&apos;une association (nom, description, adresse, email, téléphone, site
          web) : publiées sur le site, c&apos;est leur but. Base légale : exécution du service.
        </li>
        <li>
          Journaux techniques (adresse IP, date, pages demandées) conservés par les hébergeurs pour la sécurité et le
          bon fonctionnement du site. Base légale : intérêt légitime.
        </li>
      </ul>
      <h3>Durée de conservation</h3>
      <p>
        Le compte et les pages revendiquées sont conservés tant que le compte existe. Vous pouvez demander leur
        suppression à tout moment.
      </p>
      <h3>Destinataires</h3>
      <p>
        Vos données ne sont ni vendues ni cédées. Elles sont traitées par nos sous-traitants techniques : Supabase
        (base de données, authentification, envoi des emails de connexion) et Vercel (hébergement du site).
      </p>
      <h3>Vos droits</h3>
      <p>
        Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation,
        d&apos;opposition et de portabilité de vos données. Écrivez à {LEGAL.contactEmail}. Vous pouvez aussi
        adresser une réclamation à la <a href="https://www.cnil.fr/fr/plaintes">CNIL</a>.
      </p>

      <h2>Cookies et mesure d&apos;audience</h2>
      <p>
        Le site n&apos;utilise que des cookies strictement nécessaires : le cookie de session lorsque vous êtes
        connecté, et votre préférence de thème clair ou sombre, enregistrée dans votre navigateur. La mesure
        d&apos;audience (Vercel Web Analytics et Speed Insights) fonctionne sans cookie et ne produit que des
        statistiques agrégées. Aucun consentement n&apos;est donc demandé.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Le nom, le logo et la présentation du site appartiennent à l&apos;éditeur. Les données publiques restent
        soumises à la Licence Ouverte 2.0 ; les contenus publiés par les associations restent leur propriété.
      </p>
    </ProsePage>
  )
}
