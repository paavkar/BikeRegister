import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/registrations_/$registrationId/edit')({
    component: RegistrationEditComponent,
});

function RegistrationEditComponent() {
    return <div>Hello "/registrations_/$registrationId/edit"!</div>;
}
