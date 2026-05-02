import { Text } from '@fluentui/react-components';

interface NotFoundProps {
    text: string;
}

export function NotFound(props: NotFoundProps) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Text size={1000}>{props.text}</Text>
        </div>
    );
}
