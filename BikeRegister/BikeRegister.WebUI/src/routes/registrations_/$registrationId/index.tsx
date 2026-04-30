import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/registrations_/$registrationId/')({
  component: RegistrationViewComponent,
})

function RegistrationViewComponent() {
  return <div>Hello "/registrations_/$registrationId/"!</div>
}
