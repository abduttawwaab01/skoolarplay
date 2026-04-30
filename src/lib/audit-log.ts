import { db } from '@/lib/db'

interface AuditLogEntry {
  actorId: string
  actorName: string
  action: string
  entity: string
  entityId: string
  details?: Record<string, unknown>
  ipAddress?: string
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: entry.actorId,
        actorName: entry.actorName,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        details: entry.details ? JSON.stringify(entry.details) : null,
        ipAddress: entry.ipAddress || null,
      },
    })
  } catch (error) {
    console.error('Failed to write audit log:', error)
  }
}
