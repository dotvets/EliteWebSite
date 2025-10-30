import HeartbeatDivider from '../HeartbeatDivider'

export default function HeartbeatDividerExample() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Heartbeat Divider (Section Separator)</h2>
        <div className="border rounded-md p-4">
          <p className="text-muted-foreground mb-4">Content above divider</p>
          <HeartbeatDivider />
          <p className="text-muted-foreground mt-4">Content below divider</p>
        </div>
      </div>
    </div>
  )
}
