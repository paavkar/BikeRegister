import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: IndexComponent,
})

function IndexComponent() {
  return (
    <div style={{ margin: "1em" }}>
        <h1>Welcome to the Bike Register!</h1>
    </div>
  )
}