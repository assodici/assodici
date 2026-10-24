import type { Metadata } from "next"
import Link from "next/link"
import { ProsePage } from "@/components/prose-page"
import { LEGAL } from "@/lib/legal"

export const metadata: Metadata = { title: "À propos", alternates: { canonical: "/about" } }

// TODO(user): relire et compléter ce texte (brouillon rédigé à partir de ce que fait le site).
export default function AboutPage() {
  return (
    <ProsePage
      title="Retrouver les associations d'ici, simplement"
      intro="Asso d'ici rend lisible le registre de toutes les associations déclarées en France, et laisse les associations le compléter elles-mêmes."
    >
      <h2>Pourquoi Asso d&apos;ici</h2>
      <p>
        Plus de deux millions d&apos;associations sont déclarées en France : clubs de sport, chorales, comités des
        fêtes, banques alimentaires, associations de parents d&apos;élèves… Le registre officiel existe, mais il est
        difficile à consulter et souvent incomplet. Nous voulons qu&apos;il suffise d&apos;une recherche pour trouver
        l&apos;association qu&apos;il vous faut, près de chez vous.
      </p>

      <h2>D&apos;où viennent les données</h2>
      <p>
        Les fiches proviennent du Répertoire national des associations (RNA), publié par le ministère de
        l&apos;Intérieur sur data.gouv.fr sous Licence Ouverte 2.0. Nous le mettons à jour chaque semaine.
      </p>
      <p>
        Ces données officielles ont leurs limites : aucun email ni téléphone, des descriptions parfois d&apos;une
        ligne, des adresses qui n&apos;ont pas changé depuis la déclaration. Nous les affichons telles quelles et
        disons clairement ce qui manque.
      </p>

      <h2>Les associations complètent leur page</h2>
      <p>
        Une personne qui gère une association peut se connecter et revendiquer sa page. Elle peut alors corriger le
        nom, la description, l&apos;adresse et publier un contact et un site web. Ces informations remplacent les
        données officielles et sont signalées par le tampon « Infos de l&apos;asso ». Les données du RNA restent
        visibles dans la fiche officielle.
      </p>
      <p>
        La revendication est immédiate et n&apos;est pas vérifiée. Si une page est revendiquée par une personne qui
        ne représente pas l&apos;association, écrivez-nous et nous la retirerons.
      </p>

      <h2>Gratuit et indépendant</h2>
      <p>
        Asso d&apos;ici est un projet indépendant, gratuit et sans publicité. Il est réalisé
        par Pierre Lapolla.
      </p>

      <h2>Nous contacter</h2>
      <p>
        Une question, une erreur, un abus à signaler : {LEGAL.contactEmail}. Voir aussi les{" "}
        <Link href="/legal">mentions légales et la politique de confidentialité</Link>.
      </p>
    </ProsePage>
  )
}
