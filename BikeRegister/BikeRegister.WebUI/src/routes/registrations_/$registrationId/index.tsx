import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../state/authStore';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '../../../hey-api/client';
import { getFullLocale } from '../../../services/localeService';
import { 
  getApiVbyVersionRegistrationSingleByIdOptions
 } from '../../../hey-api/@tanstack/react-query.gen'
 import {
  Button,
  Toaster,
  Toast,
  ToastTitle,
  ToastBody,
  useId,
  useToastController,
  ToastTrigger,
  Link,
  Carousel,
  CarouselViewport,
  CarouselSlider,
  CarouselNavContainer,
  CarouselNav,
  CarouselNavButton,
  Text,
  Card,
  Divider,
  CardHeader,
  Body1,
  CardPreview
} from "@fluentui/react-components";
import {
  EditRegular
} from "@fluentui/react-icons";
import type { Registration, RegistrationResult } from '../../../types';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/registrations_/$registrationId/')({
  component: RegistrationViewComponent,
})

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

function RegistrationViewComponent() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const { registrationId } = Route.useParams();
  const { t } = useTranslation();
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const navigate = useNavigate({ from: '/registrations/$registrationId/' });
  const isSmall = useMediaQuery("(max-width: 600px)");

  const localClient = createClient({
    baseUrl: 'https://localhost:26786/',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept-Language': getFullLocale()
    },
  });

  const frameType: Record<number, string> = {
    0: t('other'),
    1: t('road'),
    2: t('mtb'),
    3: t('hybrid'),
    4: t('cityBike'),
    5: t('electric'),
    6: t('fatbike')
  }
  console.log(window.visualViewport?.width)

  const frameSizeUnit: Record<number, string> = {
    0: 'cm',
    1: '"',
  }

  const { data, error } = useQuery({
    ...getApiVbyVersionRegistrationSingleByIdOptions({
      client: localClient,
      path: { version: '1', id: registrationId }
    }),
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
      setRegistration(result.registration)
    }
  }, [data, error])

  return (
    <div style={{ margin: "1em", flexDirection: "column" }}>
      <Toaster toasterId={toasterId} />
      <Carousel groupSize={1} circular>
        <CarouselViewport>
          <CarouselSlider>
            {/**images here */}
          </CarouselSlider>
        </CarouselViewport> 
        <CarouselNavContainer
          layout='inline'
          autoplayTooltip={{ content: t('autoplay'), relationship: 'label'}}
          nextTooltip={{ content: t('nextImage'), relationship: 'label' }}
          prevTooltip={{ content: t('prevImage'), relationship: 'label' }}>
            <CarouselNav>
              {(index) => (
                <CarouselNavButton aria-label={`Carousel Nav Button ${index}`} />
              )}
            </CarouselNav>
        </CarouselNavContainer>
      </Carousel>
      <Card style={{ width: "99%", justifySelf: "center", marginTop: "1em" }}>
        <CardHeader header={
          <div style={{ display: "flex", flexGrow: 1 }}>
            <Body1>
              <Text size={800}>{t('registrationDetails')}</Text>
            </Body1>
            {user?.id == registration?.user.id
              ? <Button icon={<EditRegular />} appearance='primary'
                  style={{ marginLeft: "auto", height: '3em' }}
                  onClick={() => navigate({to: `/registrations/${registrationId}/edit`})}>
                  {t('editRegistration')}
                </Button>
              : null }
          </div>
        } />
        <CardPreview style={{ padding: "1em" }}>
          <div style={{
              display: "flex",
              flexDirection: isSmall ? 'column' : 'row',
              gap: isSmall ? '1em' : '5em' }}>
            <Text size={500} style={{ width: "8em" }}>
              {t('model')}
            </Text>
            {!isSmall
            ? <Divider vertical />
            : null}
            <Text size={500} style={{ width: "6em" }}>
              {registration?.model ?? 'N/A'}
            </Text>
            {isSmall
            ? <Divider />
            : null }
          </div>
            
          <div style={{
              display: "flex",
              flexDirection: isSmall ? 'column' : 'row',
              gap: isSmall ? '1em' : '5em' }}>
            <Text size={500} style={{ width: "8em", marginTop: isSmall ? '0.5em' : 'none' }}>
              {t('brand')}
            </Text>
            {!isSmall
            ? <Divider vertical />
            : null}
            <Text size={500} style={{ width: "6em" }}>{registration?.brand}</Text>
            {isSmall
            ? <Divider />
            : null }
          </div>

          <div style={{
              display: "flex",
              flexDirection: isSmall ? 'column' : 'row',
              gap: isSmall ? '1em' : '5em' }}>
            <Text size={500} style={{ width: "8em", marginTop: isSmall ? '0.5em' : 'none' }}>
              {t('modelYear')}
            </Text>
            {!isSmall
            ? <Divider vertical />
            : null}
            <Text size={500} style={{ width: "6em" }}>
              {registration?.modelYear ?? 'N/A'}
            </Text>
            {isSmall
            ? <Divider />
            : null }
          </div>

          <div style={{
              display: "flex",
              flexDirection: isSmall ? 'column' : 'row',
              gap: isSmall ? '1em' : '5em' }}>
            <Text size={500}  style={{ width: "8em", marginTop: isSmall ? '0.5em' : 'none' }}>
              {t('frameSize')}
            </Text>
            {!isSmall
            ? <Divider vertical />
            : null}
            <Text size={500} style={{ width: "6em" }}>
              {`${registration?.frameSize} ${frameSizeUnit[registration?.frameSizeUnit!]}`}
            </Text>
            {isSmall
            ? <Divider />
            : null }
          </div>

          <div style={{
              display: "flex",
              flexDirection: isSmall ? 'column' : 'row',
              gap: isSmall ? '1em' : '5em' }}>
            <Text size={500} style={{ width: "8em", marginTop: isSmall ? '0.5em' : 'none' }}>
              {t('frameType')}
            </Text>
            {!isSmall
            ? <Divider vertical />
            : null}
            <Text size={500} style={{ width: "6em" }}>
              {frameType[registration?.frameType!]}
            </Text>
            {isSmall
            ? <Divider />
            : null }
          </div>

          <div style={{
              display: "flex",
              flexDirection: isSmall ? 'column' : 'row',
              gap: isSmall ? '1em' : '5em' }}>
            <Text size={500} style={{ width: "8em", marginTop: isSmall ? '0.5em' : 'none' }}>
              {t('primaryColour')}
            </Text>
            {!isSmall
            ? <Divider vertical />
            : null}
            <Text size={500} style={{ width: "6em" }}>
              {registration?.primaryColour}
            </Text>
            {isSmall
            ? <Divider />
            : null }
          </div>

          <div style={{
              display: "flex",
              flexDirection: isSmall ? 'column' : 'row',
              gap: isSmall ? '1em' : '5em' }}>
            <Text size={500} style={{ width: "8em", marginTop: isSmall ? '0.5em' : 'none' }}>
              {t('secondaryColour')}
            </Text>
            {!isSmall
            ? <Divider vertical />
            : null}
            <Text size={500} style={{ width: "6em" }}>
              {registration?.secondaryColour}
            </Text>
            {isSmall
            ? <Divider />
            : null }
          </div>

          <div style={{
              display: "flex",
              flexDirection: isSmall ? 'column' : 'row',
              gap: isSmall ? '1em' : '5em' }}>
            <Text size={500} style={{ width: "8em", marginTop: isSmall ? '0.5em' : 'none' }}>
              {t('serialNumber')}
            </Text>
            {!isSmall
            ? <Divider vertical />
            : null}
            <Text size={500} style={{ width: "6em" }}>
              {registration?.serialNumber}
            </Text>
            {isSmall
            ? <Divider />
            : null }
          </div>

          <div style={{
              display: "flex",
              flexDirection: isSmall ? 'column' : 'row',
              gap: isSmall ? '1em' : '5em' }}>
            <Text size={500} style={{ width: "8em", marginTop: isSmall ? '0.5em' : 'none' }}>
              {t('city')}
            </Text>
            {!isSmall
            ? <Divider vertical />
            : null}
            <Text size={500} style={{ width: "6em" }}>
              {registration?.city}
            </Text>
            {isSmall
            ? <Divider />
            : null }
          </div>

          <div style={{
              display: "flex",
              flexDirection: isSmall ? 'column' : 'row',
              gap: isSmall ? '1em' : '5em' }}>
            <Text size={500} style={{ width: "8em", marginTop: isSmall ? '0.5em' : 'none' }}>
              {t('district')}
            </Text>
            {!isSmall
            ? <Divider vertical />
            : null}
            <Text size={500} style={{ width: "6em" }}>
              {registration?.district}
            </Text>
            {isSmall
            ? <Divider />
            : null }
          </div>

          <div style={{
              display: "flex",
              flexDirection: isSmall ? 'column' : 'row',
              gap: isSmall ? '1em' : '5em' }}>
            <Text size={500} style={{ width: "8em", marginTop: isSmall ? '0.5em' : 'none' }}>
              {t('description')}
            </Text>
            {!isSmall
            ? <Divider vertical />
            : null}
            <Text size={500} style={{ width: "6em" }}>
              {registration?.description}
            </Text>
            {isSmall
            ? <Divider />
            : null }
          </div>

          {registration?.isStolen
            ? 
            <div style={{
              display: "flex",
              flexDirection: isSmall ? 'column' : 'row',
              gap: isSmall ? '1em' : '5em' }}>
              <Text size={500}  style={{ width: "8em", marginTop: isSmall ? '0.5em' : 'none' }}>
                {t('dateStolen')}
              </Text>
              {!isSmall
            ? <Divider vertical />
            : null}
              <Text size={500} style={{ width: "6em" }}>
                {new Date(`${registration.dateStolen}`).toLocaleDateString()}
              </Text>
            </div>
            : null }
        </CardPreview>
      </Card>
      <Card style={{
          width: isSmall ? "99%" : "45em",
          justifySelf: "center",
          marginTop: "1em"
        }}>
        <CardHeader header={
          <Body1>
            <Text size={800}>{t('ownerDetails')}</Text>
          </Body1>
        } />
        <CardPreview style={{ padding: "1em" }}>
          <div style={{
              display: "flex",
              flexDirection: isSmall ? 'column' : 'row',
              gap: isSmall ? '1em' : '5em' }}>
            <Text size={500} style={{ width: "10em" }}>{t('name')}</Text>
            {!isSmall
            ? <Divider vertical />
            : null}
            <Text size={500} style={{ width: "20em" }}>
              {registration?.user.name}
            </Text>
            {isSmall
            ? <Divider />
            : null }
          </div>
          <div style={{
              display: "flex",
              flexDirection: isSmall ? 'column' : 'row',
              gap: isSmall ? '1em' : '5em' }}>
            <Text size={500} style={{ width: "10em", marginTop: isSmall ? '0.5em' : 'none' }}>
              {t('email')}
            </Text>
            {!isSmall
            ? <Divider vertical />
            : null}
            <Text size={500} style={{ width: "20em" }}>
              {registration?.user.email}
            </Text>
            {isSmall
            ? <Divider />
            : null }
          </div>
          <div style={{
              display: "flex",
              flexDirection: isSmall ? 'column' : 'row',
              gap: isSmall ? '1em' : '5em' }}>
            <Text size={500} style={{ width: "10em", marginTop: isSmall ? '0.5em' : 'none' }}>
              {t('phoneNumber')}
            </Text>
            {!isSmall
            ? <Divider vertical />
            : null}
            <Text size={500} style={{ width: "20em" }}>
              {registration?.user.phoneNumber}
            </Text>
            {isSmall
            ? <Divider />
            : null }
          </div>
        </CardPreview>
      </Card>
    </div>
  )
}
