import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogBody,
    Button,
    Field,
    Input,
    Toaster,
    Toast,
    ToastTitle,
    ToastBody,
    useId,
    useToastController,
    ToastTrigger,
    Link,
    Image,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { CreateRegistration } from '../components/createRegistration';
import { useAuthStore } from '../state/authStore';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '../hey-api/client';
import { getFullLocale } from '../services/localeService';
import { stolenRegistrationsOptions } from '../hey-api/@tanstack/react-query.gen';
import type { SearchFilter } from '../types';
import { useForm } from '@tanstack/react-form';
import type { Registration, RegistrationResult } from '../types';
import { RegistrationCard } from '../components/registrationCard';

export const Route = createFileRoute('/')({
    component: IndexComponent,
});

function IndexComponent() {
    const accessToken = useAuthStore((state) => state.accessToken);
    const [registrations, setRegistrations] = useState<Array<Registration>>([]);
    const [searchFilter, setSearchFilter] = useState<SearchFilter>({});
    const toasterId = useId('toaster');
    const { dispatchToast } = useToastController(toasterId);
    const isAuthenticated = accessToken !== null;
    const { t } = useTranslation();

    document.title = 'BikeRegister';

    const localClient = createClient({
        baseUrl: 'https://localhost:26786/',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Accept-Language': getFullLocale(),
        },
    });

    const form = useForm({
        defaultValues: {
            Brand: '',
            City: '',
            SerialNumber: '',
        } as SearchFilter,
        onSubmit: ({ value }) => {
            setSearchFilter(value);
        },
    });

    const { data, error } = useQuery({
        ...stolenRegistrationsOptions({
            client: localClient,
            query: searchFilter,
            path: { version: '1' },
        }),
        enabled: searchFilter !== null,
    });

    useEffect(() => {
        if (error) {
            const result = error as unknown as RegistrationResult;
            result.errors?.map((message) =>
                dispatchToast(
                    <Toast>
                        <ToastTitle
                            action={
                                <ToastTrigger>
                                    <Link>{t('dismiss')}</Link>
                                </ToastTrigger>
                            }
                        >
                            {t('registrationsFetchFail')}
                        </ToastTitle>
                        <ToastBody key={message}>{message}</ToastBody>
                    </Toast>,
                    { intent: 'error', timeout: 5000, position: 'top' },
                ),
            );
            return;
        }
        if (data) {
            const result = data as unknown as RegistrationResult;
            setRegistrations(result.registrations ?? []);
            document.title = 'BikeRegister';
        }
    }, [data, error]);

    return (
        <div style={{ margin: '1em' }}>
            <h1>Welcome to the Bike Register!</h1>
            <Toaster toasterId={toasterId} />
            <form
                style={{
                    display: 'grid',
                    gap: '1em',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(16em, 16em))',
                }}
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void form.handleSubmit();
                }}
            >
                <form.Field name='Brand'>
                    {(field) => (
                        <Field label={t('brand')}>
                            <Input
                                style={{ maxWidth: '16em' }}
                                id={field.name}
                                name={field.name}
                                type='text'
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                            />
                        </Field>
                    )}
                </form.Field>
                <form.Field name='City'>
                    {(field) => (
                        <Field label={t('city')}>
                            <Input
                                style={{ maxWidth: '16em' }}
                                id={field.name}
                                name={field.name}
                                type='text'
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                            />
                        </Field>
                    )}
                </form.Field>
                <form.Field name='SerialNumber'>
                    {(field) => (
                        <Field label={t('serialNumber')}>
                            <Input
                                style={{ maxWidth: '16em' }}
                                id={field.name}
                                name={field.name}
                                type='text'
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                            />
                        </Field>
                    )}
                </form.Field>
                <Button
                    appearance='primary'
                    style={{
                        width: '8em',
                        height: '2em',
                        alignSelf: 'flex-end',
                    }}
                    type='submit'
                >
                    {t('search')}
                </Button>
            </form>
            {isAuthenticated ? (
                <Dialog>
                    <DialogTrigger>
                        <Button
                            appearance='primary'
                            style={{ marginTop: '1em' }}
                        >
                            {t('addRegistration')}
                        </Button>
                    </DialogTrigger>
                    <DialogSurface>
                        <DialogBody>
                            <CreateRegistration />
                        </DialogBody>
                    </DialogSurface>
                </Dialog>
            ) : null}
            <div
                style={{
                    display: 'grid',
                    gap: '1rem',
                    justifyContent: 'center',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(24em, 24em))',
                }}
            >
                {registrations.map((registration) => (
                    <RegistrationCard
                        key={registration.id}
                        registration={registration}
                    />
                ))}
            </div>
        </div>
    );
}
