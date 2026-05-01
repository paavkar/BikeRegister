import {
    Button,
    Card,
    Label,
} from "@fluentui/react-components";
import { useTranslation } from 'react-i18next';
import type { Registration } from "../types";
import { useNavigate } from '@tanstack/react-router';
import {
    ArrowSquareUpRightRegular
} from "@fluentui/react-icons";

interface RegistrationProps {
    registration: Registration;
}

export function RegistrationCard ({ registration }: RegistrationProps) {
  const { t } = useTranslation();
    const navigate = useNavigate({ from: "/" });

  return (
    <>
        <Card key={registration.id} style={{ marginTop: "1em" }}>
            <Button icon={<ArrowSquareUpRightRegular />}
                onClick={() => navigate({to:`/registrations/${registration.id}`})} />
            <Label>{registration.brand}</Label>
            <Label>{registration.city}</Label>
            <Label>{registration.district}</Label>
            <Label>
                {
                `${t('stolenOn')} ${new Date(`${registration.dateStolen}`).toLocaleDateString()}`
                }
            </Label>
            <Label>{registration.user.userName}</Label>
        </Card>
    </>
  )
}