import { createFileRoute } from '@tanstack/react-router'
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  Button,
  Card,
  Label,
  Field,
  Input,
  Toaster,
  Toast,
  ToastTitle,
  ToastBody,
  useId,
  useToastController,
  ToastTrigger,
  Link
} from "@fluentui/react-components";
import { useTranslation } from 'react-i18next';
import { CreateRegistration } from '../components/createRegistration';
import { useAuthStore } from '../state/authStore';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '../hey-api/client';
import { getFullLocale } from '../services/localeService';
import { getApiVbyVersionRegistrationStolenOptions } from '../hey-api/@tanstack/react-query.gen'
import type { SearchFilter } from '../types';
import { useForm } from '@tanstack/react-form';
import { useEffect, useState } from 'react';
import type { Registration, RegistrationResult } from '../types';

export const Route = createFileRoute('/')({
  component: IndexComponent,
})

function IndexComponent() {
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((state) => state.accessToken !== null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [registrations, setRegistrations] = useState<Array<Registration>>([]);
  const [searchFilter, setSearchFilter] = useState<SearchFilter>({});

  const localClient = createClient({
    baseUrl: 'https://localhost:26786/',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept-Language': getFullLocale()
    },
  });

  const form = useForm({
    defaultValues: {
      Brand: "",
      City: "",
      SerialNumber: "",
    } as SearchFilter,
    onSubmit: ({ value }) => {
      setSearchFilter(value);
    }
  });

  const { data, error } = useQuery({
    ...getApiVbyVersionRegistrationStolenOptions({
      client: localClient,
      query: searchFilter,
      path: { version: '1' }
    }),
    enabled: searchFilter !== null,
  })

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
              }>
              {t('registrationsFetchFail')}
              </ToastTitle>
            <ToastBody key={message}>{message}</ToastBody>
          </Toast>,
          { intent: "error", timeout: 5000, position: "top" }
        )
      )
      return;
    }
    if (data) {
      const result = data as unknown as RegistrationResult;
      setRegistrations(result.registrations ?? [])
    }
  }, [data, error])

  return (
    <div style={{ margin: "1em" }}>
      <h1>Welcome to the Bike Register!</h1>
      <Toaster toasterId={toasterId} />
      <form style={{ display: "flex", flexDirection: "row", gap: "1em" }}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}>
          <form.Field name='Brand'>
            {(field) => (
              <Field label={t('brand')}>
                <Input style={{ maxWidth: "16em" }}
                  id={field.name}
                  name={field.name}
                  type='text'
                  onChange={(e) => field.handleChange(e.target.value)} />
              </Field>
            )}
          </form.Field>
          <form.Field name='City'>
            {(field) => (
              <Field label={t('city')}>
                <Input style={{ maxWidth: "16em" }}
                  id={field.name}
                  name={field.name}
                  type='text'
                  onChange={(e) => field.handleChange(e.target.value)} />
              </Field>
            )}
          </form.Field>
          <form.Field name='SerialNumber'>
            {(field) => (
              <Field label={t('serialNumber')}>
                <Input style={{ maxWidth: "16em" }}
                  id={field.name}
                  name={field.name}
                  type='text'
                  onChange={(e) => field.handleChange(e.target.value)} />
              </Field>
            )}
          </form.Field>
          <Button appearance='primary' 
            style={{ width: "8em", height: "2em", alignSelf: "flex-end" }}
              type='submit'>
              {t('search')}
          </Button>
      </form>
      {isAuthenticated
      ? 
      <Dialog>
        <DialogTrigger>
          <Button appearance='primary' style={{ marginTop: "1em" }}>
            {t('addRegistration')}
          </Button>
        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <CreateRegistration />
          </DialogBody>
        </DialogSurface>
      </Dialog>
      : null
      }
      {registrations.map((registration) => 
        (<Card key={registration.id} style={{marginTop: "1em"}}>
          <Label>{registration.brand}</Label>
          <Label>{registration.city}</Label>
          <Label>{registration.district}</Label>
          <Label>{`${t('stolenOn')} ${new Date(`${registration.dateStolen}`).toLocaleDateString()}`}</Label>
          <Label>{registration.user.userName}</Label>
        </Card>)
      )}
    </div>
  )
}