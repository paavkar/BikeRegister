import { createFileRoute, useSearch } from '@tanstack/react-router';

export const Route = createFileRoute('/confirm-email')({
    component: RouteComponent,
    validateSearch: (input: Record<string, string>) => ({
        userId: String(input.userId ?? ''),
        code: String(input.code ?? ''),
    }),
});

function RouteComponent() {
    const search = useSearch({
        from: '/confirm-email',
    });

    return (
        <div
            style={{
                display: 'flex',
                justifySelf: 'center',
                flexDirection: 'column',
            }}
        >
            <h2>{search.userId}</h2>
            <h2>{search.code}</h2>
        </div>
    );
}
