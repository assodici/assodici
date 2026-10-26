"use client"

import { useTransition } from "react"
import { releaseClaim } from "@/app/actions/profiles"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ReleaseClaimButton({ associationId }: { associationId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" className="h-11 rounded-full px-6 text-base" />}>
        Ne plus gérer cette association
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ne plus gérer cette association ?</AlertDialogTitle>
          <AlertDialogDescription>
            Vos modifications seront supprimées et la page affichera à nouveau les données officielles. Quelqu&apos;un
            d&apos;autre pourra la revendiquer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => startTransition(() => releaseClaim(associationId))}
          >
            {isPending && <Spinner />}
            Confirmer
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
