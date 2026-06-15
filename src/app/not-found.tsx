import { ErrorDisplay } from "@/components/error-display"

export default function NotFound() {
  return <ErrorDisplay code={404} message="Cette page n'existe pas." />
}
