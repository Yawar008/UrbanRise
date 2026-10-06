export interface Visit {
  visitId: string
  leadId: string
  customerName: string
  phone: string
  project: string
  config: string
  visitAt: string
  executive: string
  outcome: string
  nextAction: string
}

export interface UpdateVisitRequest {
  outcome: string
  nextAction: string
}
